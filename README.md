# ispiro.hu – statikus weboldal

Sima HTML/CSS/JS, build nélkül. Vercelen és bármilyen statikus tárhelyen fut.

## Felrakás GitHubra és Vercelre

1. Hozz létre egy új (privát) GitHub-repót, pl. `ispiro-web`.
2. Töltsd fel a mappa teljes tartalmát a repó gyökerébe (a `vercel.json` és az `index.html` a gyökérben legyen).
   - Webes felületen: „Add file → Upload files”, húzd be a fájlokat és az `assets` mappát.
   - Vagy parancssorból:
     ```
     git init
     git add .
     git commit -m "Ispiro weboldal"
     git branch -M main
     git remote add origin https://github.com/<felhasznalo>/ispiro-web.git
     git push -u origin main
     ```
3. Vercelen: **Add New → Project → Import** a repót.
   - Framework Preset: **Other**
   - Build Command: üres, Output Directory: üres (a gyökér)
   - Deploy.
4. Domain: Vercel → Project → Settings → Domains → `ispiro.hu` és `www.ispiro.hu`, majd a DNS-nél állítsd be, amit a Vercel kér.

Minden további `git push` után a Vercel magától újra kiteszi az oldalt.

## Oldalak

| Fájl | Cím (Vercelen) |
|---|---|
| `index.html` | `/` |
| `workshopok.html` | `/workshopok` |
| `workshop-valtozas-bejelentese.html` | `/workshop-valtozas-bejelentese` |
| `blog-mit-kezdhetunk-egy-valsaggal.html` | `/blog-mit-kezdhetunk-egy-valsaggal` |

## Szöveg módosítása – fontos

Minden oldalon a tartalom **kétszer** szerepel:

- `<div id="app">…</div>`: előre kirenderelt változat a keresőknek és az AI-kereső robotoknak (GEO).
- `<template id="tpl">…</template>`: ebből épül fel az élő, interaktív oldal a böngészőben.

Ha szöveget javítasz, **mindkét helyen** írd át, különben a keresők a régit látják.
Az esettanulmányok és a workshoplista szövege az oldal alján lévő `<script>` blokkban van (`CASES`, illetve `all` tömb).

## Élesítés előtt kitöltendő

- Esettanulmányok szövege és ügyfél-hozzájárulás (most helykitöltők: `[1-2 mondat]`, `[Név]` stb.).
- Az „Ahol már kérték a tudását” számai (most minta: 120+, 35) és az események neve/éve.
- Facebook és YouTube link (most `#facebook`, `#youtube`).
- Adatvédelmi tájékoztató és impresszum oldal (a linkek most üresek).
- Workshop-oldal GYIK válaszai (most helykitöltők).
- Ügyféllogók: ha lesznek fájlok, a nevek helyére kerülhetnek.

## Űrlap

Az űrlap ellenőrzi a kötelező mezőket, majd megnyitja a látogató levelezőprogramját egy kitöltött levéllel `mezriczky@ispiro.hu` címre. Később kiváltható Vercel-függvénnyel vagy Formspree-vel.

## Egyéb

- `robots.txt`, `sitemap.xml`, `llms.txt` (AI-keresőknek szóló összefoglaló), strukturált adatok (JSON-LD: cég, személy, GYIK, szolgáltatás, blogcikk).
- Betűtípus: Geist és Montserrat a Google Fontsról.
- A téma (sötét/világos) választását a böngésző megjegyzi.
