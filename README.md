# Drive Your Summer

Jeu-concours Morocco Mall · 6–27 juillet 2026
**Prix :** Soueast S05 électrique (300 000 MAD)

React (Vite + TypeScript) landing page + participation flow (inscription, upload
de tickets, tableau de bord, classement). FR/AR avec RTL.

---

## Stack

- **Vite + React 19 + TypeScript** — SPA, build statique.
- **i18n** : FR/AR via `src/i18n/{fr,ar}.json` + hook dans `src/store.tsx`. RTL via `[dir="rtl"]`.
- **État** : `src/store.tsx` (React Context). Pour l'instant **localStorage**
  (`dys_user`, `dys_receipts`, `dys_session`) — voir [docs/BACKEND_SPEC.md](docs/BACKEND_SPEC.md)
  pour le passage à une vraie API Django.
- **Polices** : Didot + Canela Trial (titres), Mulish (corps), Amiri + Cairo (arabe).
- **Images** : servies en **WebP** depuis `public/assets/` (optimisées ~8.6 MB → voir ci-dessous).

---

## Structure

```
index.html              → point d'entrée Vite (monte React dans #root)
src/
  main.tsx              → bootstrap
  App.tsx              → shell + gestion des overlays/modales
  store.tsx            → état global (i18n, auth, reçus, toasts)
  constants.ts         → CAMPAIGN_END, LEVELS (12 paliers), types
  i18n/{fr,ar}.json    → tous les textes
  components/          → Nav, Hero, CarCarousel, Speedometer, StickyCta, Toasts
  pages/              → Landing, Dashboard, Receipts
  modals/             → Register, Login, Upload
  styles/global.css    → tout le CSS (palette, RTL, responsive)
public/assets/         → images WebP + SVG + polices (ce qui est livré)
scripts/optimize-images.mjs → régénère les WebP depuis _legacy/source-assets
_legacy/               → index.html original + images sources (hors build)
docs/BACKEND_SPEC.md   → spec API Django (module « dys »)
```

---

## Modifier les textes

`src/i18n/fr.json` / `src/i18n/ar.json` — chaque clé → valeur. Ne pas toucher aux
clés (gauche), modifier les valeurs (droite), garder guillemets/virgules, UTF-8.
Les composants lisent via `t('clé')`. Pas besoin de dupliquer ailleurs.

---

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes :

```bash
npm run build            # build prod (base = /, pour Vercel/Netlify/domaine)
npm run build:gh-pages   # build pour GitHub Pages (base = /drive-your-summer/)
npm run preview          # sert le build local
npm run optimize-images  # régénère les WebP depuis _legacy/source-assets
```

---

## Déploiement

- **GitHub Pages** (servi sous `/drive-your-summer/`) :
  `npm run build:gh-pages`, publier `dist/`.
- **Vercel / Netlify / domaine racine** : `npm run build` (base `/`).
- La base est pilotée par `VITE_BASE` (voir `vite.config.ts`).

---

## Images

Les sources lourdes (PNG/JPG ~1 Mo chacune) vivent dans `_legacy/source-assets/`
**hors build**. `npm run optimize-images` les convertit en WebP redimensionnés
(qualité 78, largeur max 1600) dans `public/assets/`, avec un mapping de noms
explicite (`Soueast 1.jpg` → `soueast-1.webp`, `Key12.png` → `Key12.webp`).
L'app ne référence que les WebP.

---

## Backend

Pour l'instant tout est côté client (localStorage). La spec complète d'une API
Django (inscription, login phone+PIN, upload + validation manuelle des tickets,
classement, reset PIN) est dans **[docs/BACKEND_SPEC.md](docs/BACKEND_SPEC.md)** —
prévue comme un module `dys` à brancher sur le projet Django existant.
