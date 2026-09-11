# État de reprise

Mis à jour : 2026-09-12
Outils : Codex (laboratoires neutrino et antimatière, 2026-09-11 et 2026-09-12) et Claude Code (fiche 41, 2026-09-12), en parallèle dans le même dossier
Branche : sans objet ; dossier sans dépôt Git.

## Travail réalisé

### 2026-09-11 — Codex : laboratoire neutrino

Structure initiale de recherche conservée. À la demande de Teo, création d’un laboratoire interactif en français sur le neutrino dans neutrino/ : page autonome HTML/CSS/JS, portrait Canvas animé, oscillations à trois saveurs, réglages d’énergie et distance, quatre sources sélectionnables, explications et références CERN/Fermilab.

Calcul PMNS dans le vide : angles arrondis 33,4°, 8,6°, 49° ; écarts de masses au carré 7,5e-5 et 2,5e-3 eV² ; ordre normal et phase CP nulle. Les hypothèses sont visibles dans l’interface. L’animation principale est artistique. Les sources naturelles ne changent pas les réglages du laboratoire, qui n’est pas une simulation solaire.

README, contexte, registre des sources et lien pédagogique dans questions/15.md mis à jour.

### 2026-09-12 — Codex : laboratoire antimatière (section reconstruite)

Cette section a été reconstruite par Claude Code à partir de antimatiere/README.md, antimatiere/NOTES_SCIENTIFIQUES.md et sources/README.md, parce que les deux outils ont écrit dans AI_HANDOFF.md à quelques minutes d’intervalle (00:03 et 00:09) et que la version rédigée par Codex a pu être écrasée. Codex doit la relire et la corriger.

Deuxième exploration interactive dans antimatiere/ : comparateur particule/antiparticule, animation d’annihilation e⁻e⁺ → 2γ avec énergie cinétique réglable (0–2 MeV par particule, constantes CODATA 2022), et comptage de 24 paires avec excès signé. Notes scientifiques listant les corrections apportées à la transcription fournie par Teo (bilan énergétique, CP 1964 vs LHCb 2025, ALPHA 2023, Majorana, CMB). Sources S009 à S016 dans le registre. Liens ajoutés dans questions/15.md, 25.md et 31.md. README mis à jour.

### 2026-09-12 — Claude Code : première synthèse, question 41

À la demande de Teo (« la question à laquelle tu peux réussir à répondre », puis « va le plus deep possible avec les sources primaires »), la question 41 (limites fondamentales de la connaissance) a été choisie comme première fiche complète, parce qu’elle est la seule dont la réponse repose sur des théorèmes. L’ordre initial (commencer par 01) est donc modifié.

- questions/41.md réécrite : réponse courte, définitions, six familles de limites (auto-référence, algorithmique, indécidabilité en physique, bornes physiques, prédictibilité et horizons, intériorité) plus limites quantiques, six positions comparées, huit questions ouvertes, position de travail avec contributions propres signalées (hiérarchie à trois degrés, « théorème des conséquences », corollaires Chaitin × Lloyd et Bekenstein pour un cerveau, conjecture de conservation de l’ignorance, comparaison des sept énigmes de 1872 avec les 42 questions), liens vers 14 autres fiches, tableau de 57 sources.
- QUESTIONS.md : statut de 41 passé à « Synthèse provisoire ».
- sources/README.md : section « Question 41 » ajoutée (S017 à S073 ; renumérotée après constat que Codex avait attribué S009 à S016 à l’antimatière au même moment).
- AI_CONTEXT.md et README.md : jalon et déroulement mis à jour.

## Validation

Neutrino (Codex, 2026-09-11) et antimatière (Codex, 2026-09-12 ; tests relancés par Claude Code, voir ci-dessous) :
- node --test tests/physics.test.cjs : 5 tests réussis.
- node --check neutrino/app.js : réussi.
- node --test tests/antimatter.test.cjs et node --check antimatiere/app.js : voir le résultat consigné dans la section « Validation croisée » ci-dessous.
- Navigateur Chromium via agent-browser : réglages, saveurs, réinitialisation, sources, accordéons, pause/reprise, ancres ; aucune erreur JavaScript. Largeurs 320 à 1440 px sans débordement. Reduced-motion respecté.

Fiche 41 (Claude Code, 2026-09-12) :
- Sources : 57 références. Texte intégral consulté pour Laplace, Du Bois-Reymond (OCR), Turing 1936, Breuer 1995, Lloyd 2000, Hawking 2002 et cinq entrées de la Stanford Encyclopedia ; résumés consultés pour 30 articles (arXiv, mathnet, Tellus, IOP) ; données bibliographiques seules, vérifiées via INSPIRE, Wikipedia ou moteur de recherche, pour le reste (marqué « Bib. » dans le tableau). Accès refusés : Springer, APS, ACM, Wiley, ScienceDirect, Nature, Scholarpedia, Semantic Scholar (page), PhilPapers.
- Calculs des corollaires (Bekenstein pour R = 0,1 m et m = 1,4 kg ; Margolus-Levitin ; Landauer à 310 K) refaits en Python avec les constantes CODATA ; chiffres reportés dans la fiche avec leurs hypothèses.
- Vérification structurelle : liens internes de la fiche vers des fiches existantes ; sommaire et fiche mis à jour ensemble.
- Aucune évaluation par un tiers ; les contributions propres sont marquées comme synthèse, dérivation ou conjecture.

## Validation croisée (Claude Code, 2026-09-12)

Relancés depuis la racine le 2026-09-12 après la réconciliation des fichiers : node --test tests/antimatter.test.cjs → 6 tests, 6 réussis, 0 échec ; node --check antimatiere/app.js → réussi. Les tests neutrino de Codex n’ont pas été relancés. Aucun fichier des laboratoires n’a été modifié par Claude Code.

## Lancement des laboratoires

Depuis la racine : python3 -m http.server 4242 --bind 127.0.0.1
Adresses : http://127.0.0.1:4242/neutrino/ et http://127.0.0.1:4242/antimatiere/
Une session de serveur HTTP a pu rester active après le travail de Codex ; vérifier lors d’une reprise. Les pages fonctionnent aussi par ouverture directe de neutrino/index.html et antimatiere/index.html.

## Travail local

Tous les fichiers sont locaux et sans commit. Aucun déploiement, aucune publication, aucune écriture externe. Fichiers temporaires de recherche (textes extraits des PDF Turing, Breuer, Lloyd, OCR Du Bois-Reymond) dans le scratchpad de session, hors du dossier.

## Limites

Antimatière : acceptation visuelle par Teo non recueillie ; section de reprise reconstruite, à confirmer par Codex.

Neutrino : modèle pédagogique, pas de données de détecteur ; pas d’effets de matière, de CP non nul ni de distributions d’énergie ; acceptation visuelle par Teo non recueillie.

Fiche 41 : Chaitin 1974 et Popper 1950 non lus (accès fermé) ; deux prépublications citées (S042, S045) ; le débat Lucas-Penrose n’est pas traité ; l’ordre de grandeur du contenu informationnel d’un cerveau n’est pas sourcé ; les « nouvelles réponses » sont des synthèses et une conjecture, pas des résultats démontrés.

## Prochaine action

Éviter désormais les écritures concurrentes dans le même dossier (un outil à la fois, ou branches/worktrees dès qu’un dépôt Git existe). Recueillir la lecture de Teo sur questions/41.md et sur le laboratoire antimatière. Puis, au choix : (a) lecture directe de Chaitin 1974 et Popper 1950 pour lever les réserves ; (b) fiche 23 (théorie du tout) en s’appuyant sur le « théorème des conséquences » ; (c) fiche 10 (flèche du temps), identifiée comme partiellement answerable ; (d) retour à l’ordre du sommaire (fiche 01).
