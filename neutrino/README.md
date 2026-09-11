# Neutrino — laboratoire interactif

Page pédagogique en français, sans dépendance ni compilation. HTML, CSS, JavaScript et Canvas 2D ; polices système et aucun chargement externe pour le rendu.

## Ouvrir

Ouvrir `index.html` directement dans un navigateur, ou lancer depuis la racine du projet :

```sh
python3 -m http.server 4242 --bind 127.0.0.1
```

Puis visiter http://127.0.0.1:4242/neutrino/.

## Interactions

- Portrait animé avec pause et respect de la préférence de réduction des mouvements.
- Sélection de la saveur initiale, de l’énergie (0,2–5 GeV) et de la distance (0–3 000 km).
- Calcul des trois probabilités, courbes et retour aux réglages initiaux.
- Sélection des quatre sources : Soleil, supernovas, atmosphère, réacteurs.
- Explications dépliables et références scientifiques consultées.

## Portée scientifique

`physics.js` calcule les amplitudes de propagation dans le vide à partir d’une matrice PMNS réelle, puis leur module carré. Les valeurs arrondies et hypothèses sont visibles dans la page : ordre normal, phase CP nulle, absence d’effets de matière, faisceau monochromatique idéal. Les résultats ne sont pas une simulation d’un détecteur ni du trajet Soleil–Terre. Le portrait animé est artistique.

Les masses absolues ne sont pas déduites des oscillations ; seuls les écarts de masses au carré interviennent. Les masses au carré utilisées sont relatives à la première, dont la phase commune s’annule dans les probabilités.

## Vérifier

```sh
node --test tests/physics.test.cjs
node --check neutrino/app.js
```

Tests depuis la racine : normalisation dans le domaine des réglages, distance nulle, limite analytique à deux saveurs, dépendance en L/E et entrées invalides.
