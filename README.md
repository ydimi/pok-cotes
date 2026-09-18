# pok-cotes

Vitrine publique : pour chaque collection Pokémon relevée, les cartes les plus recherchées
avec la fourchette des ventes réellement conclues depuis la sortie du set.

Publié sur GitHub Pages : https://ydimi.github.io/pok-cotes/

## Ce dépôt ne contient que du HTML

Les scripts, les relevés de prix, les cotes et la méthode vivent dans un atelier **local et
non versionné**. Ce dépôt ne reçoit que des pages déjà rendues, copiées une par une par
`publish.mjs` depuis une liste blanche nommée. Trois garde-fous indépendants :

1. la **liste blanche** de `publish.mjs` — on n'y copie jamais un dossier, uniquement des
   fichiers nommés ;
2. une **deny-list** par motif, qui interrompt la publication (`exit 1`) au moindre nom
   suspect ;
3. ce **`.gitignore` inversé**, qui interdit par défaut toute donnée.

## Publier

```bash
node publish.mjs          # copie la liste blanche depuis l'atelier, puis affiche le bilan
git add -A && git commit -m "chore: maj du site" && git push
```

Ou, depuis Claude dans l'atelier : `/publie`.

## Tester en local

```bash
python3 -m http.server 8080    # puis http://localhost:8080
```
