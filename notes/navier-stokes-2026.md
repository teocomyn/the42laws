# Navier-Stokes : l’équation, le problème du millénaire et la « résolution » d’OpenAI (8 septembre 2026)

Note de recherche rédigée le 2026-09-12, quatre jours après l’annonce. Tout ce qui concerne septembre 2026 est postérieur à la date de connaissance de l’assistant et repose exclusivement sur les sources listées en bas de page, consultées le 12 septembre. Statut : **synthèse provisoire, événement en cours**.

[Fiche 23](../questions/23.md) · [Fiche 41](../questions/41.md) · [Registre des sources](../sources/README.md) · [Laboratoire interactif](../navier-stokes/index.html)

## 1. L’équation

Les équations de Navier-Stokes décrivent le mouvement d’un fluide visqueux incompressible (eau, air à basse vitesse). Inconnues : le champ de vitesse u(x, t) (un vecteur en chaque point et à chaque instant) et la pression p(x, t). Données : la viscosité ν > 0, la vitesse initiale u°(x) et une force extérieure f(x, t) (la gravité, par exemple).

**Forme vectorielle** (densité normalisée à 1) :

$$
\frac{\partial u}{\partial t} + (u\cdot\nabla)\,u \;=\; -\nabla p \;+\; \nu\,\Delta u \;+\; f, \qquad \nabla\cdot u = 0, \qquad u(x,0) = u^\circ(x).
$$

En texte : du/dt + (u·∇)u = −∇p + ν Δu + f ; div u = 0 ; u(x, 0) = u°(x).

**Forme en composantes, telle qu’écrite par Fefferman dans l’énoncé officiel du prix Clay (S143, équations (1)-(3))** :

$$
\frac{\partial u_i}{\partial t} + \sum_{j=1}^{n} u_j \frac{\partial u_i}{\partial x_j} \;=\; \nu\,\Delta u_i - \frac{\partial p}{\partial x_i} + f_i(x,t), \qquad
\operatorname{div} u = \sum_{i=1}^{n} \frac{\partial u_i}{\partial x_i} = 0, \qquad
u(x,0) = u^\circ(x),
$$

avec x dans R^n (n = 2 ou 3), t ≥ 0, et Δ le laplacien en espace. Avec ν = 0, ce sont les équations d’Euler (1757).

**Ce que dit chaque terme.**

| Terme | Sens | Nature |
| --- | --- | --- |
| ∂u/∂t | variation de la vitesse en un point fixe | linéaire |
| (u·∇)u | transport de la vitesse par le fluide lui-même (une particule change de vitesse parce qu’elle change de place) | **non linéaire** : toute la difficulté est là |
| −∇p | poussée du fluide comprimé vers le fluide moins comprimé | linéaire ; p est déterminée par la contrainte div u = 0 |
| ν Δu | frottement visqueux, qui lisse les gradients de vitesse | linéaire, régularisant |
| f | force extérieure imposée | donnée |
| div u = 0 | incompressibilité : ce qui entre dans un volume en sort | contrainte |

Fefferman résume : l’équation (1) « is just Newton’s law f = ma for a fluid element », et (2) « just says that the fluid is incompressible » (S143). Navier avait écrit la même structure en 1822, avec une constante de frottement qu’il note ε : « P − dp/dx = ρ(du/dt + u du/dx + v du/dy + w du/dz) + ε(d²u/dx² + d²u/dy² + d²u/dz²) » (S140, section III, lu à l’Académie le 18 mars 1822). Stokes la redérive en 1845 (S141, S142).

## 2. Le problème du millénaire (Clay, 2000)

Fefferman impose des conditions de décroissance à l’infini sur u° et f (équations (4)-(5)), demande des solutions lisses (« p, u ∈ C∞(R^n × [0, ∞)) », (6)) et d’énergie cinétique bornée (« ∫ |u(x, t)|² dx < C for all t ≥ 0 », (7)), ou bien des solutions périodiques sur le tore R³/Z³ ((8)-(11)). Il demande ensuite la preuve de **l’un** des quatre énoncés suivants (S143, texte intégral consulté) :

- **(A)** Existence et régularité sur R³ : pour toute donnée initiale lisse, à divergence nulle, vérifiant (4), **avec f ≡ 0**, il existe une solution lisse d’énergie bornée pour tout temps.
- **(B)** Même chose sur le tore R³/Z³, **avec f ≡ 0**.
- **(C)** Rupture sur R³ : « there exist a smooth, divergence-free vector field u°(x) on R³ and a smooth f(x, t) on R³ × [0, ∞), satisfying (4), (5), for which there exist no solutions (p, u) of (1), (2), (3), (6), (7) on R³ × [0, ∞) ».
- **(D)** Même rupture sur le tore.

Deux remarques qui commandent toute la suite. Premièrement, les énoncés positifs (A) et (B) sont **sans force** ; les énoncés négatifs (C) et (D) **autorisent une force lisse**. L’asymétrie est dans le texte officiel. Deuxièmement, Fefferman précise que si une solution explose en temps fini T, « the velocity becomes unbounded near the blowup time ».

**Ce qu’on savait avant 2026 (sources vérifiées).** Leray 1934 : solutions faibles globales d’énergie finie, régularité laissée ouverte (S144) ; Ladyzhenskaya : régularité en dimension 2 (S143) ; Caffarelli, Kohn, Nirenberg 1982 : l’ensemble singulier d’une solution faible convenable est de mesure de Hausdorff parabolique unidimensionnelle nulle (S145) ; Tao 2016 : explosion en temps fini pour une équation de Navier-Stokes *moyennée* qui conserve l’identité d’énergie (S064) ; Buckmaster et Vicol 2019 : non-unicité des solutions faibles d’énergie finie (S147) ; Albritton, Brué et Colombo 2022 : deux solutions de Leray distinctes avec vitesse initiale nulle et la même force (S148) ; Elgindi 2021 : singularités en temps fini pour Euler dans la classe C^{1,α} sur R³ (S149) ; Chen et Hou 2022 : explosion auto-similaire pour Euler axisymétrique avec données lisses **et un bord**, preuve assistée par ordinateur (S150) ; Córdoba et Martínez-Zoroa 2023-2025 : mécanisme d’amplification couche par couche donnant des singularités pour Euler avec force et pour l’équation des milieux poreux avec source lisse (S151, S152) ; Wang, Gómez-Serrano, Buckmaster et al. (Google DeepMind) 2025 : découverte numérique de familles de singularités *instables* par réseaux de neurones (S153).

## 3. Ce qu’OpenAI a annoncé le 8 septembre 2026

**Le théorème, cité mot pour mot du PDF de 166 pages (S156, texte intégral consulté) :**

> Theorem 1.1. For every ν > 0 there exist a force f ∈ C_c^∞(R³ × (0, ∞); R³), a compact set K ⊂ R³, and smooth velocity and pressure fields u, p on R³ × [0, 1) satisfying ∂_t u + (u·∇)u − νΔu + ∇p = f, ∇·u = 0, u(·, 0) = 0, such that supp u(·, t) ∪ supp p(·, t) ⊂ K for every 0 ≤ t < 1, sup_{0≤t<1} ‖u(t)‖_{L²(R³)} < ∞, lim sup_{t↑1} ‖u(t)‖_{L^∞(R³)} = ∞.

Et la conséquence revendiquée : « Consequently, there is no smooth solution (u, P) on R³ × [0, ∞) with the same force and initial datum whose kinetic energy is uniformly bounded [...]. This establishes alternative (C) in the Millennium problem statement for Navier–Stokes as stated by Fefferman in [13]. Compact support also yields the corresponding construction on T³ = R³/Z³, establishing alternative (D) ».

**En français courant.** On part d’un fluide au repos (u° = 0). On le pousse avec une force lisse, à support compact en espace et en temps, donc « raisonnable » au sens de Fefferman. On construit explicitement l’écoulement : un tourbillon dont le cœur se contracte en colonne de plus en plus fine et élancée (rayon ∼ √τ, hauteur ∼ τ^{1/2−h} avec τ = 1 − t le temps restant et 0 < h < 1/100, S156 §2), où le fluide spirale vers l’axe et s’échappe axialement ; la conservation du moment cinétique accélère la rotation à mesure que le rayon diminue. À t = 1, la vitesse maximale devient infinie tandis que l’énergie cinétique reste bornée. Le point délicat, dit le texte, n’est pas de faire exploser un écoulement (« we can always define the external force f to be the residual »), c’est de le faire exploser **avec une force qui reste lisse jusqu’au bout** ; des pulsations oscillantes sont ajoutées pour que leurs flux de quantité de mouvement annulent la partie singulière du résidu.

**Filiation revendiquée par le texte.** Le PDF cite Leray, Caffarelli-Kohn-Nirenberg, Escauriaza-Seregin-Šverák, Tao 2016, Buckmaster-Vicol, Albritton-Brué-Colombo, et surtout Córdoba et Martínez-Zoroa pour la stratégie d’amplification à travers les échelles avec contrôle de la régularité de la force (S156 §1.1). La bibliographie du PDF ne cite pas les travaux de Buckmaster et Alpöge de 2026, qui n’étaient pas publics avant le 7 septembre.

**Vérification formelle.** Le dépôt public openai/NavierStokesAndEuler (S158, licence Apache-2.0, Lean 4.34.0-rc2 avec Mathlib, fichiers NavierStokes.lean et Euler.lean) contient, selon son README, la formalisation de « There exist smooth initial data and forcing for which no global smooth solution with uniformly bounded kinetic energy exists » sur R³ et sur le tore, ainsi qu’un résultat séparé pour Euler **sans force** : « We construct smooth, compactly supported, divergence-free initial velocity on ℝ³ whose solution to the unforced incompressible Euler equations develops a singularity in finite time. » Cette seconde revendication, si elle tient, règle le problème de régularité d’Euler lui-même, qui n’est pas un problème Clay mais est ouvert depuis le XVIIIe siècle ; elle n’a pas été examinée ici au-delà du README. Un audit indépendant (S164, presse spécialisée) rapporte que le dépôt d’OpenAI et celui de Buckmaster-Alpöge ne contiennent aucune déclaration d’axiome et compilent avec un Mathlib épinglé ; nous n’avons pas compilé nous-mêmes.

**Moyens déclarés** (S157 miroir du billet, S159, S162 : chiffres d’OpenAI, non vérifiables de l’extérieur) : un modèle interne « significantly more capable than GPT-6 Astra », environ 10 000 agents coordonnés, 88 heures entre le lancement du 1er septembre et le résultat du 5 septembre, 2,7 millions de messages, environ 130 milliards de jetons produits ; annonce le 8 septembre. OpenAI déclare ne pas réclamer le prix.

## 4. Ce que cela règle et ce que cela ne règle pas

1. **Formellement, l’alternative (C) du texte officiel est visée**, et (D) en découle par support compact. Le texte de Fefferman autorise une force lisse dans (C). Sur ce point, la lecture d’OpenAI est conforme à la lettre de l’énoncé.
2. **Le problème que la communauté considère comme « le » problème, à savoir (A)/(B) avec f ≡ 0, reste ouvert.** La presse spécialisée parle d’« a force most mathematicians exclude » et note qu’il n’y a « no public evidence that the construction works without it » (S163). Tao, la veille de l’annonce, décrivait le même programme (forçage lisse) pour trois équations modèles et jugeait « very feasible » son achèvement prochain, avec « a high likelihood of also extending to Navier-Stokes » (S154). Le cas non forcé de Navier-Stokes n’est revendiqué par personne au 12 septembre.
3. **Physiquement, rien n’explose.** Le résultat porte sur le modèle mathématique (milieu continu, incompressible, newtonien) ; il dit que ce modèle, poussé par une force lisse, peut produire des vitesses infinies en un point et un instant, à énergie bornée. Bien avant, l’hypothèse du continu cesse d’être valable. C’est une pathologie du modèle, importante pour comprendre la turbulence et la limite des simulations, pas une prédiction sur l’eau.
4. **Le prix n’est pas attribué et ne peut pas l’être avant des années.** L’Institut Clay exige une publication dans une revue qualifiée, un délai de deux ans et l’acceptation générale de la communauté ; il liste toujours le problème comme « Active » (S165) ; son président Martin Bridson annonce une évaluation « deliberately unhurried » et « absolutely rigorous » (S163). Wikipedia qualifie le problème de « possibly solved » et précise que le résultat « has yet to be verified by the Clay Institute or the independent mathematical community » (S160).
5. **Un certificat Lean prouve qu’un énoncé suit des axiomes ; il ne prouve pas que l’énoncé formalisé est celui du prix.** La correspondance entre le théorème Lean et les conditions (4)-(7) de Fefferman doit être vérifiée par des humains. Nous ne l’avons pas fait.

## 5. La controverse de priorité (chronologie d’après S159, S161, S162, S154)

- 17 septembre 2025 : prépublication à 22 auteurs (DeepMind, Gómez-Serrano, Buckmaster) sur les singularités instables (S153).
- Depuis environ un an, en privé : Buckmaster (Courant Institute, NYU) et Alpöge (mathématicien, salarié d’Anthropic, collaboration « strictement personnelle ») poursuivent le programme Córdoba-Martínez-Zoroa avec des modèles de langage d’Anthropic et d’OpenAI.
- 15 août 2026 : première solution explosive obtenue ; 22 août : vérification Lean.
- 28 août : OpenAI entraîne un modèle dédié aux problèmes du millénaire ; 1er septembre : lancement d’une exécution de 88 heures, après des rumeurs selon lesquelles « deux problèmes du millénaire » avaient été résolus.
- 6 septembre : Sébastien Bubeck (OpenAI) contacte les deux mathématiciens.
- 7 septembre, tard le soir : Buckmaster rend publics, avec Alpöge et Coiculescu, trois résultats d’explosion en temps fini **avec force lisse** (milieux poreux, Boussinesq, Euler 3D) et leur formalisation Lean (S155), et affirme que leur travail a fuité vers OpenAI ; il évoque trois mécanismes possibles, dont l’usage de ses sessions Codex. Tao publie le même jour un billet saluant « a remarkable achievement » (S154).
- 8 septembre, midi : annonce d’OpenAI et publication du PDF et du dépôt Lean.
- Réponse d’OpenAI (Bubeck, cité par S162) : « We did not use their prompts or proofs to prompt our models or direct our agents » ; l’entreprise reconnaît par ailleurs, selon S159, l’usage de données « de-identified » et « derived » issues de sessions d’utilisateurs, dont celles des deux mathématiciens, comme un facteur parmi d’autres de l’amélioration du modèle.
- Fefferman, cité par Quanta (S161) : « I was thrilled that the problem was solved », les « héros » de l’histoire étant Córdoba et Martínez-Zoroa.
- Tao, cité par S162 : « The indiscriminate strip-mining of open problems for solutions may destroy the ecosystem from which the next generation of mathematical techniques, problems, and practitioners would have developed. »

Nous ne prenons pas position sur les accusations ; les deux versions sont rapportées telles quelles, avec leurs sources. Le point vérifiable est le suivant : les deux dépôts Lean ont été publiés le même matin, à quelques heures d’intervalle (S164).

## 6. Rapport avec les fiches du carnet

- **Fiche 41.** Les mêmes équations d’Euler et de Navier-Stokes admettent des solutions stationnaires Turing-complètes, donc des trajectoires indécidables (S047, S049). L’explosion en temps fini et l’universalité computationnelle sont deux pathologies distinctes du même modèle : la première dit que le modèle sort de son domaine de validité ; la seconde que, même dans son domaine, certaines questions sur ses solutions n’ont pas de réponse algorithmique. Tao avait relié les deux dès 2016 (S064).
- **Fiche 23.** Le sixième problème de Hilbert (dériver les fluides des particules, S074-S075) et le problème du millénaire (régularité des fluides) sont les deux extrémités d’une même chaîne, et toutes deux ont bougé en 2025-2026, avec une assistance massive de l’IA dans le second cas. La « leçon du sixième problème » (fiche 23, contribution 5) vaut ici aussi : les solutions arrivent, mais la compréhension, au sens de Tao, est une autre affaire.
- **Méthode.** Cet épisode est un cas d’école pour la règle « dater les états de la recherche » : tout ce qui est écrit ici peut être caduc dans un mois.

## 7. Sources

Consultées le 2026-09-12. Statuts : « Texte » (texte intégral), « Résumé », « Bib. » (référence vérifiée, contenu via secondaires), « Presse ».

| Id | Référence | Statut |
| --- | --- | --- |
| S140 | Navier, C.-L., « Mémoire sur les lois du mouvement des fluides », lu le 18 mars 1822, *Mém. Acad. Roy. Sci. Inst. France* 6 (1827), 389-440 ; texte sur Wikisource | Texte (section III) |
| S141 | Stokes, G. G., « On the theories of the internal friction of fluids in motion... », *Trans. Camb. Phil. Soc.* 8 (1845 ; publié 1849), 287-319 | Bib. |
| S142 | Bistafa, S. R., « 200 years of the Navier-Stokes equation », arXiv:2401.13669 (2023) | Résumé |
| S143 | Fefferman, C. L., « Existence and smoothness of the Navier-Stokes equation », Clay Mathematics Institute, 2000, https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf | Texte |
| S144 | Leray, J., « Sur le mouvement d’un liquide visqueux emplissant l’espace », *Acta Math.* 63 (1934), 193-248 | Bib. |
| S145 | Caffarelli, L., Kohn, R., Nirenberg, L., « Partial regularity of suitable weak solutions of the Navier-Stokes equations », *Comm. Pure Appl. Math.* 35 (1982), 771-831 | Bib. |
| S064 | Tao, T., « Finite time blowup for an averaged three-dimensional Navier-Stokes equation », *J. Amer. Math. Soc.* 29 (2016), 601-674 (déjà au registre) | Résumé |
| S147 | Buckmaster, T., Vicol, V., « Nonuniqueness of weak solutions to the Navier-Stokes equation », *Ann. Math.* 189 (2019), 101-144, arXiv:1709.10033 | Résumé |
| S148 | Albritton, D., Brué, E., Colombo, M., « Non-uniqueness of Leray solutions of the forced Navier-Stokes equations », *Ann. Math.* 196 (2022), 415-455, arXiv:2112.03116 | Résumé |
| S149 | Elgindi, T., « Finite-time singularity formation for C^{1,α} solutions to the incompressible Euler equations on R³ », *Ann. Math.* 194 (2021), 647-727, arXiv:1904.04795 | Résumé |
| S150 | Chen, J., Hou, T. Y., « Stable nearly self-similar blowup of the 2D Boussinesq and 3D Euler equations with smooth data I », arXiv:2210.07191 (2022, v4 août 2026) | Résumé |
| S151 | Córdoba, D., Martínez-Zoroa, L., « Blow-up for the incompressible 3D-Euler equations with uniform C^{1,1/2−ε} ∩ L² force », arXiv:2309.08495 (2023 ; à paraître au *Duke Math. J.* selon S154 et secondaires) | Résumé |
| S152 | Córdoba, D., Martínez-Zoroa, L., « Finite time singularities of smooth solutions for the 2D incompressible porous media (IPM) equation with a smooth source », arXiv:2410.22920 (2024, v3 février 2025) | Résumé |
| S153 | Wang, Y. et al. (22 auteurs, dont Buckmaster et Gómez-Serrano ; Google DeepMind), « Discovery of unstable singularities », arXiv:2509.14185 (17 septembre 2025) | Résumé |
| S154 | Tao, T., « Finite time blowup with smooth forcing term for the incompressible porous medium, Boussinesq, and incompressible Euler equations », blog *What’s new*, 7 septembre 2026 | Texte |
| S155 | Buckmaster, T., annonce sur Mastodon (mastodon.social/@tristanbuckmaster/117233413705701198), 7-8 septembre 2026, et déclaration PDF | Bib. (connu via S159, S162) |
| S156 | OpenAI, « Finite Time Blowup for Navier-Stokes », PDF, 166 pages, https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf | Texte (résumé, Théorème 1.1, §1.1, §2 lus ; preuve non examinée) |
| S157 | OpenAI, « On the Navier-Stokes Millennium Prize Problem », billet du 8 septembre 2026, https://openai.com/index/navier-stokes-solution/ (accès direct refusé ; lu via le miroir alphaXiv) | Texte (miroir) |
| S158 | Dépôt GitHub openai/NavierStokesAndEuler, « Lean certificates accompanying Navier-Stokes and Euler results », Apache-2.0 | Texte (README) |
| S159 | Wikipedia (en), « Navier-Stokes priority controversy », consulté le 12 septembre 2026 | Secondaire |
| S160 | Wikipedia (en), « Navier-Stokes existence and smoothness » et « Millennium Prize Problems », consultés le 12 septembre 2026 | Secondaire |
| S161 | Quanta Magazine, « AI Has Solved One of Math’s 1 Million Millennium Prize Problems », 8 septembre 2026 | Presse |
| S162 | Fortune, 8 septembre 2026 (accusations de Buckmaster, réponse de Bubeck, citation de Tao) | Presse |
| S163 | Implicator.ai, « Clay Institute Won’t Call Navier-Stokes Solved by OpenAI » (citation de Martin Bridson) | Presse |
| S164 | Stanford Tech Review, « OpenAI vs Buckmaster: The Navier-Stokes Lean Proofs, Audited » | Presse spécialisée |
| S165 | Clay Mathematics Institute, page du problème, statut « Active » | Texte |

Non consultés : le billet d’OpenAI en accès direct (403), l’article de Nature du 8 septembre (d41586-026-02842-5, accès refusé), la déclaration PDF de Buckmaster, les trois prépublications de Buckmaster-Alpöge-Coiculescu et leur dépôt Lean, le fil Mathstodon de Tao (contenu non chargé).

## Historique

- 2026-09-12 : création, à la demande de Teo (« l’équation dite de Navier-Stokes avec la résolution d’OpenAI »). 26 références. À réviser dès qu’un examen indépendant du PDF ou une réponse de l’Institut Clay est publié.
- 2026-09-12 (b) : laboratoire interactif navier-stokes/ ajouté (fluide 2D, schéma de l’explosion, énoncés (A)-(D)).
