# Navier-Stokes — laboratoire interactif

Cinquième exploration de The42laws, créée le 2026-09-12 à la demande de Teo, en complément de la [note sur l’annonce d’OpenAI](../notes/navier-stokes-2026.md). HTML, CSS, JavaScript et Canvas 2D ; aucune dépendance ni ressource distante.

## Ouvrir

Ouvrir `index.html`, ou depuis la racine du projet :

```sh
npm run dev
```

puis http://127.0.0.1:4242/navier-stokes/ (ou le serveur Python déjà utilisé pour les autres laboratoires).

## Trois expériences

1. **L’équation**, terme par terme, avec le rôle de chacun.
2. **Un fluide 2D à manipuler** : équations de Navier-Stokes incompressibles sur le tore [0, 2π)², viscosité réglable (10⁻⁴ à 0,3), force appliquée au pointeur, trois vues (vorticité, vitesse, colorant), deux états initiaux physiques (Taylor-Green, deux jets opposés) et le repos. Mesures en direct : énergie cinétique, énergie théorique de Taylor-Green et écart, vitesse maximale, nombre de Reynolds approché, divergence discrète, temps de calcul.
3. **Le schéma de l’explosion** : famille auto-similaire reproduisant les échelles de longueur du Théorème 1.1 d’OpenAI (rayon ≍ τ^½, hauteur ≍ τ^(½−h)), avec ‖u‖∞ qui diverge et ‖u‖₂ constante ; puis les quatre énoncés (A)-(D) de Fefferman et leur statut.

## Modèle numérique

- Advection semi-lagrangienne (retour en arrière RK2, interpolation bilinéaire périodique), d’après Stam 1999.
- Diffusion et projection de Leray exactes dans l’espace de Fourier (FFT radix-2 maison, grille 64, 128 ou 256).
- Pas de temps 0,02 ; modes de Nyquist annulés.
- Test analytique : tourbillons de Taylor-Green, u = A cos x sin y, v = −A sin x cos y, dont l’énergie décroît exactement en π²A²e^{−4νt}. La différence mesurée est la dissipation numérique de l’advection (environ −8 % sur t = 1 à ν = 0,05 en 64², −4 % en 128²).

## Vérifier

```sh
node --test tests/navier-stokes.test.cjs
node --check navier-stokes/app.js
```

Les tests couvrent l’aller-retour de la FFT, l’exactitude de la projection (elle retire exactement un gradient), le taux de diffusion spectral, la conservation du champ de Taylor-Green à la dissipation numérique près (tolérances calibrées par résolution), la décroissance monotone de l’énergie sans force, l’absence de valeurs non finies, la famille auto-similaire et le rejet des entrées invalides.

Voir [NOTES_SCIENTIFIQUES.md](NOTES_SCIENTIFIQUES.md) pour les limites.
