# Notes scientifiques — laboratoire Navier-Stokes

Rédaction : 2026-09-12. Sources détaillées dans [notes/navier-stokes-2026.md](../notes/navier-stokes-2026.md) (S140-S165).

## Ce que la page montre et ne montre pas

- **Dimension 2, pas 3.** Le laboratoire résout les équations en dimension 2 sur un tore. En dimension 2, l’existence et la régularité globales sont démontrées (Ladyzhenskaya ; rappelé par Fefferman, S143). Aucune singularité ne peut apparaître dans la simulation, quels que soient les réglages. La page le dit explicitement ; c’est le contraste avec la dimension 3 qui est pédagogique.
- **La force du pointeur est une force extérieure f.** Elle n’est pas lisse en temps (impulsions discrètes) ; elle sert à sentir le terme f, pas à reproduire la construction d’OpenAI.
- **Le schéma d’explosion n’est pas une simulation.** C’est une famille de nombres (rayon, hauteur, vitesse, énergie) construite à partir de deux échelles de longueur citées du texte d’OpenAI (S156, section 2 : ℓ_r ≍ τ^{1/2}, ℓ_z ≍ τ^{1/2−h}, 0 < h < 1/100). L’exposant de vitesse −(3/4 − h/2) est choisi pour que U²·volume soit constant, ce qui illustre « vitesse non bornée, énergie bornée » ; il n’est pas tiré du texte, dont l’exposant réel n’a pas été relu. Aucune affirmation sur la validité de la preuve n’est faite.
- **Les statuts « revendiqué, non validé » sont datés du 12 septembre 2026** et doivent être révisés avec la note.

## Schéma numérique

- Advection semi-lagrangienne : inconditionnellement stable, mais dissipative. Sur Taylor-Green (solution exacte), l’énergie mesurée est inférieure à la théorie d’environ 8 % après t = 1 à ν = 0,05 en 64², 4 % en 128² ; l’écart diminue avec la résolution et augmente quand ν diminue, parce que la dissipation numérique devient alors dominante. Le nombre de Reynolds affiché est donc une borne supérieure grossière.
- Diffusion et projection dans l’espace de Fourier : exactes pour la grille (facteur e^{−ν|k|²Δt} par mode ; projection û − k(k·û)/|k|²). La divergence discrète affichée est calculée par différences centrées ; elle n’est pas identiquement nulle (opérateur différent), mais tend vers zéro avec la résolution.
- Modes de Nyquist mis à zéro (signe ambigu) ; pas de désaliasage supplémentaire. À très faible viscosité et forte excitation, de petites structures parasites peuvent apparaître ; elles sont un artefact du schéma.
- Pas de temps fixe 0,02 ; pas de contrôle de CFL nécessaire pour la stabilité, mais la précision se dégrade pour des vitesses de grille supérieures à quelques cellules par pas.
- Unités sans dimension : longueur du domaine 2π, viscosité ν, temps t. Le nombre de Reynolds est estimé par U_max·2π/ν.

## Références directes de la page

Navier 1822 (S140, texte Wikisource) ; Fefferman 2000 (S143, PDF lu) ; OpenAI 2026 (S156, S158) ; Tao 2026 (S154). Stam 1999 et Taylor-Green 1937 sont cités pour attribution des méthodes, sans avoir été relus pour cette page.
