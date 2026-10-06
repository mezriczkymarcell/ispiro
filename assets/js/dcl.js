/*
 * dcl.js – kis sablonmotor az oldalak interaktív részeihez.
 * Támogatja: {{kifejezés}} szövegben és attribútumban, <sc-if value>, <sc-for list as>,
 * on*-eseménykezelőket ({{fuggveny}}), és a Component osztályt (state, setState, renderVals).
 * Az előre renderelt (statikus) tartalmat a betöltés után a <template id="tpl"> alapján cseréli élőre.
 */
(function () {
  'use strict';

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const p = typeof patch === 'function' ? patch(this.state) : patch;
      Object.assign(this.state, p);
      if (this.__schedule) this.__schedule();
    }
  }

  const RX = /\{\{([^}]+)\}\}/g;

  function resolve(expr, scope) {
    const e = expr.trim();
    if (e === 'true') return true;
    if (e === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
    let v = scope;
    for (const k of e.split('.')) { if (v == null) return undefined; v = v[k]; }
    return v;
  }

  function parts(str) {
    const out = []; let last = 0, m;
    RX.lastIndex = 0;
    while ((m = RX.exec(str))) {
      if (m.index > last) out.push(str.slice(last, m.index));
      out.push({ e: m[1] });
      last = RX.lastIndex;
    }
    if (last < str.length) out.push(str.slice(last));
    return out;
  }

  function renderParts(ps, scope) {
    if (ps.length === 1 && typeof ps[0] !== 'string') return resolve(ps[0].e, scope);
    return ps.map(p => {
      if (typeof p === 'string') return p;
      const v = resolve(p.e, scope);
      return v == null || v === false ? '' : String(v);
    }).join('');
  }

  // Egy csomópontlista lefordítása: frissítő függvények listáját adja vissza.
  function compileList(nodes) {
    const ups = [];
    for (const n of nodes) compileNode(n, ups);
    return scope => { for (const u of ups) u(scope); };
  }

  function compileNode(node, ups) {
    if (node.nodeType === 3) {
      if (!node.data.includes('{{')) return;
      const ps = parts(node.data);
      let prev;
      ups.push(scope => { const v = renderParts(ps, scope); const s = v == null || v === false ? '' : String(v); if (s !== prev) { node.data = s; prev = s; } });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();

    if (tag === 'sc-if') {
      const expr = (node.getAttribute('value') || '').replace(/^\s*\{\{|\}\}\s*$/g, '');
      const anchor = document.createComment('if');
      const kids = Array.from(node.childNodes);
      node.replaceWith(anchor);
      const update = compileList(kids);
      let shown = false;
      ups.push(scope => {
        const on = !!resolve(expr, scope);
        if (on) {
          if (!shown) { let ref = anchor; for (const k of kids) { ref.after(k); ref = k; } shown = true; }
          update(scope);
        } else if (shown) { for (const k of kids) k.remove(); shown = false; }
      });
      return;
    }

    if (tag === 'sc-for') {
      const expr = (node.getAttribute('list') || '').replace(/^\s*\{\{|\}\}\s*$/g, '');
      const as = node.getAttribute('as') || 'item';
      const tpl = document.createDocumentFragment();
      Array.from(node.childNodes).forEach(k => tpl.appendChild(k));
      const start = document.createComment('for');
      const end = document.createComment('/for');
      node.replaceWith(start, end);
      const inst = [];
      ups.push(scope => {
        const list = resolve(expr, scope) || [];
        while (inst.length > list.length) { const it = inst.pop(); it.nodes.forEach(k => k.remove()); }
        while (inst.length < list.length) {
          const frag = tpl.cloneNode(true);
          const nodes = Array.from(frag.childNodes);
          const up = compileList(nodes);
          end.before(frag);
          inst.push({ nodes, up });
        }
        list.forEach((item, i) => inst[i].up(Object.assign(Object.create(scope), { [as]: item, $index: i })));
      });
      return;
    }

    for (const attr of Array.from(node.attributes)) {
      const name = attr.name, val = attr.value;
      if (name.startsWith('hint-')) { node.removeAttribute(name); continue; }
      if (!val.includes('{{')) continue;
      node.removeAttribute(name);
      const ps = parts(val);
      if (name.startsWith('on')) {
        let fn = null;
        node.addEventListener(name.slice(2), e => { if (typeof fn === 'function') fn(e); });
        ups.push(scope => { fn = renderParts(ps, scope); });
        continue;
      }
      let prev;
      ups.push(scope => {
        const v = renderParts(ps, scope);
        if (v === prev) return; prev = v;
        if (v === true) node.setAttribute(name, '');
        else if (v === false || v == null) node.removeAttribute(name);
        else node.setAttribute(name, String(v));
      });
    }
    const childUp = compileList(Array.from(node.childNodes));
    ups.push(childUp);
  }

  function mount(Component, opts) {
    const o = opts || {};
    const tpl = document.getElementById(o.template || 'tpl');
    const root = document.getElementById(o.root || 'app');
    const inst = new Component({});
    const frag = tpl.content.cloneNode(true);
    const nodes = Array.from(frag.childNodes);
    const update = compileList(nodes);
    let queued = false;
    const run = () => { queued = false; update(inst.renderVals()); };
    inst.__schedule = () => { if (!queued) { queued = true; Promise.resolve().then(run); } };
    update(inst.renderVals());
    root.replaceChildren(frag);
    if (typeof inst.componentDidMount === 'function') inst.componentDidMount();
    return inst;
  }

  window.DCLogic = DCLogic;
  window.DCL = { mount };
})();
