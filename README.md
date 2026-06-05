# Drive Your Summer — Landing Page

Jeu-concours Morocco Mall · 6–27 juillet 2026  
**Prix :** Soueast S05 électrique (300 000 MAD)

Live : https://ralialahlou.github.io/drive-your-summer

---

## Structure du projet

```
index.html              → Page principale (SPA auto-contenue)
translations/
  fr.json               → Tous les textes en français
  ar.json               → Tous les textes en arabe
Soueast 1-4.jpg         → Photos de la voiture
soueast 5.jpg           → Photo hero
```

---

## Modifier les textes (sans toucher au code)

Ouvrez `translations/fr.json` ou `translations/ar.json`.  
Chaque ligne est une clé → valeur :

```json
"hero.tag": "6 juillet – 27 juillet 2026"
```

**Règles :**
- Ne pas modifier les clés (partie gauche entre guillemets)
- Modifier uniquement les valeurs (partie droite)
- Respecter les guillemets et les virgules
- Sauvegarder en UTF-8

Après modification, copier-coller la nouvelle valeur dans l'objet `T` correspondant dans `index.html` (section `const T = { fr: {...}, ar: {...} }`).

---

## Tech stack

- HTML / CSS / JS vanilla — aucune dépendance, aucun build step
- LocalStorage : données utilisateur (`dys_user`), reçus (`dys_receipts`), session (`dys_session`)
- i18n : attribut `data-i18n="clé"` pour les textes simples ; classes `fr-txt`/`ar-txt` pour les blocs HTML complexes
- RTL : sélecteur CSS `[dir="rtl"]` sur `<html>`
- Polices : Cormorant Garamond (titres), DM Sans (corps), Amiri + Cairo (arabe)

---

## Lancer en local

```bash
# Python 3
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

Sur mobile (même réseau Wi-Fi) :
```bash
python3 -m http.server 8080 --bind 0.0.0.0
# ouvrir http://<IP-locale>:8080
```

---

## Déploiement GitHub Pages

Le site est déployé automatiquement depuis la branche `main`.  
Tout push sur `main` met à jour https://ralialahlou.github.io/drive-your-summer en ~1 minute.

---

## Données de démonstration

Les inscriptions et tickets sont stockés dans le `localStorage` du navigateur.  
Les codes PIN (4 chiffres) et les codes de réinitialisation sont simulés côté client.  
En production, remplacer par une API backend sécurisée.
