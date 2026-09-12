# État de reprise

Mis à jour : 2026-09-12
Outils : Codex (laboratoires neutrino et antimatière, 2026-09-11 et 2026-09-12) et Claude Code (fiches 41 puis 23, 2026-09-12), en parallèle dans le même dossier
Branche principale : main. Finalisation V2 isolée sur codex/atlas-v2 ; voir le dernier jalon pour l’état actuel.

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

### 2026-09-12 — Claude Code : deuxième synthèse, question 23

Sur demande de Teo (« go sur la fiche 23 »). questions/23.md réécrite : réponse en quatre sens (unification / déduction des constantes / dérivation de tout / finalité) avec un verdict par sens ; sections sur ce que nous avons, où cela casse, les candidats (cordes/M, boucles, sécurité asymptotique, CDT, ensembles causaux) et leur statut empirique, les limites de principe, la méthode ; sept positions comparées ; huit questions ouvertes ; contributions propres signalées (quadripartition, argument « la finalité n’est pas une propriété empirique », carte quantitative de l’ignorance, test des cordes par interdiction via DESI, leçon du sixième problème de Hilbert résolu en 2025, conjecture d’indépendance des quatre sens) ; 66 sources (S074-S139). QUESTIONS.md et sources/README.md mis à jour ; questions/41.md corrigée pour créditer Barrow 2006 d’une formulation antérieure du « théorème des conséquences ».

### 2026-09-12 — Claude Code : note Navier-Stokes et annonce d’OpenAI

Sur demande de Teo (« l’équation dite de Navier-Stokes avec la résolution d’OpenAI »). Création de notes/navier-stokes-2026.md : l’équation (formes vectorielle et Fefferman, sens des termes, Navier 1822 cité), l’énoncé officiel du prix Clay avec les quatre alternatives (A)-(D) tirées du PDF de Fefferman, l’état de l’art avant 2026, le Théorème 1.1 du PDF d’OpenAI cité mot pour mot avec le mécanisme physique, le dépôt Lean, ce que cela règle (alternative (C) avec force lisse) et ne règle pas (cas sans force, prix, validation humaine), la chronologie de la controverse Buckmaster-Alpöge, les liens avec les fiches 23 et 41. 26 références (S140-S165). README, sources/README.md et questions/23.md mis à jour. L’événement date du 8 septembre 2026, postérieur à la date de connaissance de l’assistant : tout repose sur des sources consultées le 12 septembre.

### 2026-09-12 — Claude Code : laboratoire Navier-Stokes

Sur demande de Teo (« peux-tu me coder ça »), interprétée comme un laboratoire dans le format des précédents. Dossier navier-stokes/ : index.html, style.css, app.js, physics.js, icon.svg, README.md, NOTES_SCIENTIFIQUES.md ; test tests/navier-stokes.test.cjs (9 tests). Contenu : l’équation terme par terme ; un solveur 2D incompressible sur le tore (advection semi-lagrangienne RK2 + diffusion et projection exactes par FFT maison, grilles 64/128/256, viscosité 10⁻⁴ à 0,3, force au pointeur, vues vorticité/vitesse/colorant, états initiaux Taylor-Green et jets opposés, mesures en direct dont l’énergie théorique de Taylor-Green) ; un schéma de l’explosion (famille auto-similaire avec les échelles de longueur du Théorème 1.1 d’OpenAI, exposant de vitesse choisi pour une énergie constante, clairement signalé comme modèle jouet) ; les quatre énoncés (A)-(D) de Fefferman avec statut daté ; références. Navigation atlas-bridge comme les autres laboratoires. **Non relié à content/atlas.json** (fichier de Codex) : entrée suggérée ci-dessous.

Entrée proposée pour content/atlas.json (à adapter au schéma exact) : id « navier-stokes », title « Navier-Stokes », url « navier-stokes/index.html », description « L’équation des fluides, un tore 2D à manipuler et le schéma de l’explosion revendiquée en 2026 », questions liées 23 et 41, parcours « connaissance ».

## Coordination entre outils (Claude Code, 2026-09-12, 00:55)

Constat : Codex a initialisé le dépôt Git (commits 53642f3 et 671f910), construit l’atlas V1 et continué à écrire (questions/10.md, 15.md, content/*-essentiel.md, photon/, temps/) pendant que Claude Code rédigeait les fiches 41 et 23 et la note Navier-Stokes. Les deux jeux de modifications sont mêlés dans l’arbre de travail, non commités. Claude Code n’a rien commité (aucune demande de Teo) et n’a touché à aucun fichier de l’atlas, des laboratoires ou de content/. Le script de construction lit le statut des fiches dans questions/*.md ; la fiche 23 apparaîtra comme « Synthèse provisoire » à la prochaine construction. npm test relancé par Claude Code après ses écritures : voir « Validation croisée ». Recommandation : que Teo ou Codex commite l’état courant en deux commits (contenu de recherche Claude / atlas et laboratoires Codex), puis un seul outil à la fois sur l’arbre, ou des branches.

## Validation

Neutrino (Codex, 2026-09-11) et antimatière (Codex, 2026-09-12 ; tests relancés par Claude Code, voir ci-dessous) :
- node --test tests/physics.test.cjs : 5 tests réussis.
- node --check neutrino/app.js : réussi.
- node --test tests/antimatter.test.cjs et node --check antimatiere/app.js : voir le résultat consigné dans la section « Validation croisée » ci-dessous.
- Navigateur Chromium via agent-browser : réglages, saveurs, réinitialisation, sources, accordéons, pause/reprise, ancres ; aucune erreur JavaScript. Largeurs 320 à 1440 px sans débordement. Reduced-motion respecté.

Fiches 41, 23 et note Navier-Stokes (Claude Code, 2026-09-12) :
- Sources : 57 références. Texte intégral consulté pour Laplace, Du Bois-Reymond (OCR), Turing 1936, Breuer 1995, Lloyd 2000, Hawking 2002 et cinq entrées de la Stanford Encyclopedia ; résumés consultés pour 30 articles (arXiv, mathnet, Tellus, IOP) ; données bibliographiques seules, vérifiées via INSPIRE, Wikipedia ou moteur de recherche, pour le reste (marqué « Bib. » dans le tableau). Accès refusés : Springer, APS, ACM, Wiley, ScienceDirect, Nature, Scholarpedia, Semantic Scholar (page), PhilPapers.
- Calculs des corollaires (Bekenstein pour R = 0,1 m et m = 1,4 kg ; Margolus-Levitin ; Landauer à 310 K) refaits en Python avec les constantes CODATA ; chiffres reportés dans la fiche avec leurs hypothèses.
- Vérification structurelle : liens internes de la fiche vers des fiches existantes ; sommaire et fiche mis à jour ensemble.
- Fiche 23 : 23 références vérifiées via l’API INSPIRE (DOI → titre, auteurs, revue, volume, page) ; texte intégral pour Laughlin-Pines 2000 et la SEP ; résumés arXiv/ADS pour 45 articles ; le reste en bibliographie seule. L’API arXiv n’a pas répondu pour GWTC-3 ; l’article de Nature 2025 (Aziz et al.) n’est connu que par Phys.org.
- Laboratoire Navier-Stokes : node --test tests/navier-stokes.test.cjs → 9/9 (FFT aller-retour < 10⁻¹², projection exacte, taux de diffusion e^{−2νΔt} à 10⁻⁶, Taylor-Green suivi à −12 % en 64² et −6 % en 128² sur t = 1, monotonie de l’énergie, absence de NaN, famille auto-similaire, entrées invalides) ; npm test complet → 35/35 ; node --check app.js ; page ouverte dans le navigateur intégré : rendu, animation (5,5 ms par pas en 128²), écart Taylor-Green −0,6 % à t = 0,14, schéma d’explosion, aucune erreur console.
- Note Navier-Stokes : PDF d’OpenAI et PDF de Fefferman extraits par pdftotext et lus (résumé, théorème, sections 1-2 pour OpenAI ; énoncé complet pour Fefferman) ; preuve de 166 pages non examinée ; dépôts Lean non compilés ; billet d’OpenAI lu via miroir (accès direct refusé) ; Nature et Axios inaccessibles.
- Aucune évaluation par un tiers ; les contributions propres sont marquées comme synthèse, dérivation ou conjecture.

## Validation croisée (Claude Code, 2026-09-12)

Relancés depuis la racine le 2026-09-12 après la réconciliation des fichiers : node --test tests/antimatter.test.cjs → 6 tests, 6 réussis, 0 échec ; node --check antimatiere/app.js → réussi. Les tests neutrino de Codex n’ont pas été relancés. Aucun fichier des laboratoires n’a été modifié par Claude Code.

## Lancement des laboratoires

Depuis la racine : python3 -m http.server 4242 --bind 127.0.0.1
Adresses : http://127.0.0.1:4242/neutrino/ et http://127.0.0.1:4242/antimatiere/
Une session de serveur HTTP a pu rester active après le travail de Codex ; vérifier lors d’une reprise. Les pages fonctionnent aussi par ouverture directe de neutrino/index.html et antimatiere/index.html.

## Travail local

État historique avant la V1 : tous les fichiers étaient locaux et sans commit. Le dépôt Git et l’atlas ont ensuite été créés ; voir le jalon V1 ci-dessous. Aucun déploiement, aucune publication, aucune écriture externe. Fichiers temporaires de recherche (textes extraits des PDF Turing, Breuer, Lloyd, OCR Du Bois-Reymond) dans le scratchpad de session, hors du dossier.

## Limites

Antimatière : acceptation visuelle par Teo non recueillie ; section de reprise reconstruite, à confirmer par Codex.

Neutrino : modèle pédagogique, pas de données de détecteur ; pas d’effets de matière, de CP non nul ni de distributions d’énergie ; acceptation visuelle par Teo non recueillie.

Laboratoire Navier-Stokes : simulation 2D (aucune singularité possible, dit explicitement) ; le schéma d’explosion n’utilise que les deux échelles de longueur citées du texte d’OpenAI ; dissipation numérique de l’advection documentée.

Note Navier-Stokes : événement en cours, à réviser à chaque nouvelle source ; ne pas citer comme « résolu » sans les réserves de la section 4.

Fiche 23 : Hawking 1980, Weinberg 1992, Dawid 2013 non lus ; décompte des paramètres du Modèle standard non tiré d’une source primaire ; DESI et le témoin d’intrication sont des sujets actifs à re-vérifier avant toute citation ultérieure.

Fiche 41 : Chaitin 1974 et Popper 1950 non lus (accès fermé) ; deux prépublications citées (S042, S045) ; le débat Lucas-Penrose n’est pas traité ; l’ordre de grandeur du contenu informationnel d’un cerveau n’est pas sourcé ; les « nouvelles réponses » sont des synthèses et une conjecture, pas des résultats démontrés.

## Prochaine action historique (avant l’atlas V1)

Éviter désormais les écritures concurrentes dans le même dossier (un outil à la fois, ou branches/worktrees dès qu’un dépôt Git existe). Recueillir la lecture de Teo sur questions/41.md, questions/23.md et le laboratoire antimatière. Puis, au choix : (a) fiche 10 (flèche du temps) ou 19 (décohérence et mesure), identifiées comme partiellement answerable ; (b) comparaison des 42 questions d’Allen et Lidström 2017 (S139) avec les nôtres ; (c) lectures directes manquantes (Chaitin 1974, Popper 1950, Hawking 1980) ; (d) retour à l’ordre du sommaire (fiche 01).


## 2026-09-12 — Codex : atlas V1

À la suite de l’autorisation « GO DÉVELOPPE ÇA PLEASE », construction du socle proposé : accueil, atlas des 42 questions, lecteur appliqué à la question 41 et intégration des deux laboratoires. Trois parcours guidés et carnet local ajoutés pour relier les contenus.

### Architecture et périmètre

- Racine `index.html`, `atlas/style.css`, `atlas/app.js`, `atlas/core.js` ; navigation par fragments pour fonctionner sur un serveur statique ou directement depuis le fichier.
- Les 42 Markdown et le dossier original 41 restent inchangés. `content/atlas.json` contient les domaines, liens et parcours ; `content/41-essentiel.md` apporte une courte lecture éditoriale avec réserves de portée.
- `npm run build` produit `atlas/data.js` via Marked 18.0.12 (dépendance de construction seulement). Le navigateur n’utilise aucune ressource distante. `npm run dev` reconstruit les sources modifiées et sert en local ; rafraîchir la page après édition.
- Atlas : recherche par mots, filtres domaine/statut, état vide et liens individuels. Lecteur : essentiel / dossier complet / 57 références, sommaire, précédent/suivant, notes.
- Carnet dans `localStorage` sous `the42laws:v1` : favoris, lectures manuelles, notes, dernière question, laboratoires ouverts. Export JSON ; pas d’import ni de synchronisation. Statut scientifique et lecture personnelle distincts. Une erreur de stockage est affichée et la note courante reste exportable.
- Navigation de retour à l’atlas ajoutée aux deux laboratoires, sans changement de leurs moteurs physiques.
- Premier instantané Git de l’existant : 53642f3. Aucun déploiement ni écriture externe.

### Validation V1

- `npm run build` : 42 questions, une synthèse provisoire, deux laboratoires.
- `npm test` : 17 tests réussis (11 physiques existants, 6 atlas/rendu/états/liens).
- Chromium : les 42 lecteurs, les trois modes de la question 41, les 57 lignes de sources, recherche sans accents, combinaison de filtres, état vide, réinitialisation, trois parcours, méthode, registre, carnet et route inconnue vérifiés. Aucune erreur JavaScript remontée.
- Note et favori conservés après rechargement. Note avec balisage traitée comme texte. Export JSON téléchargé par interaction et contenu relu avec assertions. Refus de stockage simulé : message visible, application utilisable.
- Dix vues contrôlées à 320, 390, 768 et 1440 px : aucun débordement horizontal de page. Tableaux scientifiques défilables dans leur conteneur. Menu mobile : clavier, boucle de focus, Échap, navigation masquée rendue inerte.
- Liens de retour des deux laboratoires, calcul du neutrino à l’ouverture et absence de débordement à 320 px vérifiés. Ouverture directe de l’atlas en `file://` vérifiée.
- Serveur de développement essayé sur le port 4243 : accueil et données HTTP 200, `.git` et `node_modules` refusés (403). Le serveur initial sur 4242 reste l’adresse de prévisualisation.
- Captures locales non versionnées : `artifacts/atlas-home.png`, `artifacts/atlas-mobile.png`, `artifacts/atlas-reader.png`. Scripts de contrôle navigateur et export de test dans `artifacts/` (ignoré par Git).

### Réserves et suite

La fiche 41 demeure provisoire. Sa lecture courte précise les hypothèses des limites démontrées et ne reprend pas les extrapolations comme des théorèmes universels. Vérification ciblée de portée avec Stanford Encyclopedia of Philosophy, « Gödel’s Incompleteness Theorems » ; aucun réexamen exhaustif des 57 sources. Le tri historique « seule question answerable » ne constitue pas une conclusion scientifique. Les propositions propres du dossier original sont conservées pour discussion.

Les 41 autres dossiers sont explicitement à explorer ; aucun nouveau contenu de réponse n’a été fabriqué. Les parcours temps et connaissance incluent donc des étapes sans synthèse. L’export constitue une copie du carnet, pas un système de restauration intégré.

Prochaine étape suggérée après retour de Teo : rédiger un nouveau dossier sourcé ou développer le prochain laboratoire (photon / double fente), en utilisant l’architecture commune. Les pistes antérieures ne sont pas des autorisations de travail supplémentaires.


## 2026-09-12 — Codex : atlas V2, livraison des six volets

Autorisation : Teo a demandé de mettre en place toute la feuille de route, puis a précisé « Pas encore : préparer la version publiable » pour l’hébergement. Aucun déploiement ni domaine créé.

### Livré

- Fiche 23 intégrée avec résumé de portée prudent. Dossier original et ses 66 références conservés, sans revue exhaustive ni validation nouvelle de toutes ses affirmations.
- Fiches 15 et 10 rédigées comme premières synthèses pédagogiques (4 sources chacune) ; résumés courts et statuts synchronisés. Fiche 41 originale préservée. Quatre synthèses dans l’atlas, 38 questions à explorer.
- Tableau interactif de 17 entrées de particules : filtres, sélection, propriétés, sources et liens. Détails accessibles dans une fenêtre sur mobile.
- Photon : diffraction d’une ou deux fentes, information de chemin, longueur d’onde, séparation, impacts unitaires/par lots/animés, histogramme et modèle théorique. Probabilités conditionnées à un écran fini ; pas de trajectoires assignées. 10 000 impacts maximum.
- Temps : modèle d’urnes avec transition paresseuse, comptage binomial, entropie du macroétat, fluctuations, distribution d’équilibre et historique rejouable. Pas de prétention à simuler l’Univers ou inverser son temps. 1 000 transitions maximum.
- Trois parcours enrichis, 15 définitions dans le glossaire et au clic dans les dossiers, 37 liens éditoriaux sur une carte navigable au clavier ou par sélection.
- Carnet : import JSON validé, aperçu, conflits explicités, conservation des notes existantes par défaut ou remplacement choisi. Fusion des favoris/lectures. Échec de stockage : carnet courant préservé. Export maintenu.
- Présentation du projet et copie des liens de dossiers sans notes personnelles. Mention explicite quand l’adresse est locale.
- Construction publique par liste de fichiers autorisés, 42 pages statiques de questions sans JavaScript, image de partage originale, sitemap/URL canoniques configurables via SITE_URL, archive ZIP et PUBLICATION.md. Aucun fichier de travail IA, secret ou carnet dans le paquet.

### Préservation des travaux parallèles

Un travail distinct sur Navier-Stokes a continué dans le dossier principal. La finalisation a été déplacée dans `/Users/teocomyn/.codex/worktrees/the42laws-atlas-v2` (branche codex/atlas-v2) ; les fichiers du dossier principal ont été comparés avant réintégration. Les textes et le laboratoire Navier-Stokes n’ont pas été modifiés par cette V2. Le laboratoire autonome est conservé dans le paquet, sans ajout aux quatre cartes de l’atlas.

Les références propres à la V2 ont été déplacées de S140-S151 à **S200-S211**, pour préserver S140-S165 attribués par l’autre travail. Les Markdown des fiches 10/15 et le registre ont été synchronisés. Sauvegardes des modifications initiales et des fichiers avant intégration dans `artifacts/` (ignoré par Git).

### Validation

- 35 tests réussis : 26 pour l’atlas, l’import, les laboratoires neutrino/antimatière/photon/temps ; 9 tests du module Navier-Stokes existant relancés sans modification.
- Tests indépendants : zéros et symétrie de diffraction, normalisation, disparition du terme d’interférence, énergie du photon ; comptage des urnes par énumération et équilibre détaillé ; entrées invalides et fusion des notes.
- Navigateur : 17 particules, filtres, détails, 66 sources de la fiche 23, glossaire au clic, recherche, 42 nœuds de la carte, liens éditoriaux, partage, import invalide puis valide, conservation/remplacement des conflits, export réellement téléchargé et relu.
- Laboratoires : incréments, réglages, remise à zéro, play/pause, historique, relecture exacte et conditions initiales contrôlés.
- Onze vues de l’atlas à 320/390/768/1440 px sans débordement. Les deux nouveaux laboratoires contrôlés aux quatre largeurs. Menu et fenêtres : clavier/Échap. Aucun démarrage automatique ; contrôle reduced-motion et page statique avec JavaScript désactivé.
- agent-browser utilisé ; deux sessions se sont bloquées lors du test du sélecteur de fichiers. Les essais finaux ont été réalisés avec Playwright fourni par le runtime, notamment un vrai setInputFiles, sans changer le produit pour contourner un défaut.
- Paquet public : **132 fichiers, 596 liens/ressources locaux vérifiés**, 42 pages de dossiers statiques. Test des chemins canoniques, du sitemap et de l’image avec une adresse de test réservée, puis reconstruction sans domaine. Vérification sans fichiers de travail.
- Captures et scripts de QA dans artifacts/. Archive livrable : artifacts/the42laws-v2-public.zip.

### Limites et reprise

Le carnet n’est pas synchronisé ; l’import/export permet son transfert d’une origine à une autre. Les liens de partage locaux ne sont pas des liens publics. La publication est préparée mais volontairement non effectuée, conformément au choix de Teo.

Les dossiers demeurent provisoires. Les liens entre questions sont éditoriaux, pas des implications démontrées. La relecture scientifique de 23 est ciblée sur la portée, pas une revue des 66 références. Les assertions de la note Navier-Stokes appartiennent au travail distinct et n’ont pas été réévaluées dans ce lot.

Prochaine action : recueillir le retour de Teo sur la V2 ; lorsqu’un hébergement sera choisi, configurer SITE_URL, reconstruire et vérifier les véritables URL publiques. Préférer un worktree par outil lors de recherches parallèles.


## 2026-09-12 — Codex : préparation de l’envoi GitHub

Teo a explicitement demandé de pousser le projet sur https://github.com/teocomyn/the42laws. Dépôt public existant, sans référence distante au contrôle initial. La branche main regroupe la V2 et les recherches/laboratoires déjà présents, dont Navier-Stokes. Les fichiers de construction, artefacts locaux, dépendances et fichiers .env restent ignorés.

Avant envoi : construction réussie (42 questions, 4 dossiers, 4 laboratoires intégrés), 35 tests réussis, git diff --check sans erreur. Aucun motif de clé privée ou jeton courant détecté dans les fichiers à versionner ni l’historique. Ce jalon concerne le code source ; aucun déploiement du site ni domaine configuré. Vérifier la concordance entre HEAD local et origin/main après le push.


## 2026-09-12 — Codex : correction du build Vercel

Autorisation : Teo demande de faire fonctionner son déploiement Vercel après STATIC_BUILD_NO_OUT_DIR sur 8e76010. Projet existant the42laws, équipe t4c2s-projects. vercel.json impose Other, npm ci, build:public puis check:public, sortie build/public et barre finale des URL de répertoires. Node fixé à 22.x dans package.json et lockfile.

Validation avant push : installation propre, construction publique et contrôle des 132 fichiers/596 liens/42 pages réussis ; 35 tests réussis. Configuration documentée dans PUBLICATION.md. Correctif préparé dans le worktree codex/vercel-build-fix pour préserver la modification locale préexistante de navier-stokes/physics.js, exclue de ce lot. Le statut distant et les URL doivent être vérifiés après le push.


## 2026-09-12 — Codex : domaine the42laws.fr

Teo a acheté the42laws.fr chez Hostinger et a demandé sa connexion. Domaine principal associé à la production Vercel ; www.the42laws.fr ajouté avec redirection permanente 308 vers the42laws.fr. Valeurs DNS fournies par le tableau de bord du projet : A @ 216.198.79.1 et CNAME www 302a4e082b86e61f.vercel-dns-017.com. Zone initiale : A @ 2.57.91.91 (TTL 50), CNAME www the42laws.fr. (TTL 300), aucun autre enregistrement. Sauvegarde locale ignorée par Git dans artifacts/dns-the42laws-before.json. Validation et mise à jour Hostinger acceptées par API, TTL 300 pour les deux enregistrements. Aucune modification de serveurs de noms.

La construction Vercel fournit SITE_URL=https://the42laws.fr. Construction locale avec le domaine validée : 133 fichiers, 595 liens locaux, 42 pages statiques et sitemap. Worktree codex/domain-fr ; modification Navier-Stokes du dossier principal préservée et exclue. Vérifier les DNS publics, HTTPS, redirection www et les métadonnées après propagation et nouveau déploiement.


## 2026-09-12 — Lots 1 et 2 : consolidation et approfondissement

Demande explicite de Teo sur les lots 1 et 2 de la feuille de route jointe. Branche codex/lots-1-2 dans /Users/teocomyn/.codex/worktrees/the42laws-lots-1-2. Base 66f8781. Instantané des quatre modifications Navier préexistantes repris intégralement, comparé au dossier principal et sauvegardé dans artifacts/lots-1-2-navier-original. Correctifs ciblés : démarrage du fluide en pause, référence Taylor-Green désactivée après modification de viscosité, colorant fini pour dipôle d’amplitude nulle. Le reste des nouveautés Navier provient du travail préexistant.

Livraison : quatre nouvelles synthèses sourcées 19/25/26/30 avec niveaux de preuve et de consultation ; repères communs sur les huit dossiers ; pages /dossiers/{id}/ statiques et interactives unifiées, reprise des anciens fragments ; parcours sans fiche vide obligatoire ; cinq expériences guidées et export des observations ; textes de publication actualisés ; CI GitHub. Sources S300-S308 ajoutées. Relecture scientifique indépendante de 23/41 non effectuée ; les réserves restent visibles.

Validation locale : 40 tests réussis, 136 fichiers et 1101 liens/ressources locaux contrôlés, unicité des titres et identifiants sur les 42 pages. Tests navigateur des cinq guides : Photon 500 impacts par configuration, Neutrino même L/E mêmes probabilités, antimatière 1,022 → 2,022 MeV, urnes 50 transitions dans chaque préparation, Navier t=1 avec énergie 8,749 et référence 9,111 (écart numérique −4 % affiché). Vrai export JSON téléchargé et relu avec deux relevés et la prédiction. Note locale de test conservée après rechargement et migration d’un ancien lien ; partage canonique sans note ; navigation aller/retour de parcours. Les quatre nouveaux dossiers et les cinq laboratoires testés à 320 px sans débordement ni erreur console ; captures supplémentaires à 390 px.

La prévisualisation du travail était sur 4246 (source) et 4247 (paquet public). Ne pas confondre build local, push GitHub et déploiement Vercel : contrôler ces deux derniers jalons après envoi. Le chantier Axeptio demeure séparé, non intégré à ce lot.

Validation distante : 3056d00 poussé sur origin/main, workflow GitHub Actions 34687984862 réussi, déploiement Vercel dpl_BFnnpZ5T5NHzvXNZWhabV8gUZHye READY en production. Les quatre nouvelles pages et les assets du guide répondent 200 sur the42laws.fr ; canoniques vérifiées, texte complet dans les réponses HTML, fiche 1 noindex. Lecteur réel du dossier 19 et onglet complet testés sans erreur console. Le serveur Python 4242 a été remplacé par npm run dev dans le dossier principal pour servir les nouvelles routes. Le stash « Preserved pre-lots Navier work, integrated in 3056d00 » conserve l’instantané original : ne pas le réappliquer automatiquement, son contenu est déjà intégré. La branche consentement n’a pas été fusionnée.

## 2026-09-12 — Lot 3 : relativité et nouvelles portes d’entrée

Teo demande de continuer et de mettre Axeptio de côté. Périmètre retenu : lot 3 de la feuille de route (relativité, existence, vie, conscience). Travail dans codex/lot-3, worktree /Users/teocomyn/.codex/worktrees/the42laws-lot-3, base dac6410. La branche de consentement n’est pas fusionnée et ne doit pas être reprise sans nouvelle demande.

Livraison : synthèses provisoires 1/32/36, résumés, repères, exercices, sources S320–S325 avec niveau de lecture indiqué. Relativité : deux trajectoires entre départ et retrouvailles, temps propres, vitesse 0–0,99 c, durée terrestre 1–40 ans, diagramme, pause/pas/curseur, guide A/B, export et lien de réglages. Modèle de relativité restreinte à deux segments constants, demi-tour instantané idéal ; aucune gravitation ni calcul de signaux reçus. Sources S326–S327. Nouveau parcours « Exister, vivre, ressentir », relativité ajoutée au parcours temps, six laboratoires reconnus par le carnet sans changer sa version. Onze synthèses et 31 fiches à explorer.

Validation locale : 44 tests réussis, dont exemples 3-4-5, invariance des intervalles sur les deux segments, continuité du temps propre, limites des entrées et import du nouveau laboratoire. Paquet public : 140 fichiers, 1130 liens/ressources et 42 pages de dossiers contrôlés. Navigateur : relevés 8 ans à 0,60 c et 6 ans à 0,80 c pour 10 ans terrestres ; repos et extrêmes, demi-tour, pas, pause, partage réellement copié et restauré. Export JSON réellement téléchargé et relu. Trois nouveaux lecteurs à 320 px, sources et navigation aller/retour des parcours validés. Laboratoire à 320/390/768/1440 px sans débordement ni erreur console. Pas de relecture scientifique humaine indépendante.

Prévisualisation temporaire : PORT=4248 npm run dev. Publication distante et actualisation du serveur principal 4242 à contrôler après intégration. Aucun changement DNS, Analytics ou Axeptio dans ce lot.

Validation distante du lot 3 : commit 6a87e7c poussé sur origin/main, GitHub Actions 34690927248 réussi, déploiement Vercel dpl_63HKJR4xgBXnLtrToacCHF97VUqE READY en production. Les trois nouvelles pages et /relativite/ sont accessibles en HTTPS, indexables, avec canoniques correctes et présents au sitemap. Le HTML contient les textes et sources des dossiers. publication.json confirme 11 synthèses et 6 laboratoires. Test navigateur en production : 10 ans terrestres / 6 ans voyageur à 0,80 c, aucune erreur console. Serveur local principal redémarré sur 4242 avec cette version. Le lot 3 est livré ; prochains chantiers possibles : lot 4, carnet enrichi et quiz pédagogiques, seulement à la prochaine demande.

## 2026-09-12 — Favicon 42 irisé

Demande : créer un logo 42 pour le favicon, inspiré de la référence de verre dépoli fournie par Teo. Direction retenue : chiffres blancs épais, verre bleu/menthe/lilas, fond charbon assorti au site. Visuel original créé avec l’outil intégré image_gen ; seconde passe pour remplacer le damier généré par un fond uni (aucune transparence revendiquée). Source de référence personnelle non copiée dans le dépôt. Master public atlas/logo-42.png, déclinaisons PNG 16/32/48/180/512 px et favicon.ico contenant 16/32/48. Six études SVG de structure et leur comparaison sont conservées localement dans artifacts/logo-42, hors publication.

Intégration : accueil, six laboratoires, 42 dossiers générés, index des dossiers et page 404 utilisent le favicon commun ; apple-touch-icon 180 px pour les raccourcis mobiles. Nouvelles adresses PNG pour renouveler le cache. Anciennes icônes SVG conservées mais non référencées. Les logos dans le contenu de l’interface restent inchangés. Le build copie favicon.ico et le serveur local sert correctement PNG/ICO.

Contrôles locaux : icône ICO multi-tailles valide, PNG aux dimensions déclarées, aperçu en 16 et 32 px ; construction publique et 1284 liens/ressources contrôlés dans 147 fichiers. Vérifier après publication les réponses HTTPS et les nouvelles balises sur le domaine.

## Reprise — Branding cobalt / verre, 2026-09-12

Travail isolé sur codex/branding depuis bd56fca. Accueil recomposé, logo 42 dans la navigation, cartes illustrées des six laboratoires, palette et typographie communes, continuité dans le lecteur, les guides et la page 404. Nouvel aperçu social brand-share.png. Voir BRANDING.md pour les fichiers et règles d’usage.

Validation locale de livraison : 44 tests réussis, construction publique réussie, 158 fichiers et 1431 liens/ressources internes contrôlés, 42 dossiers statiques. Vérifications visuelles 320/390/768/1440 px ; six laboratoires à 320 px sans débordement horizontal ; passage accueil → atlas, recherche « conscience », lecture complète du dossier 10, menu mobile et Échap. Console sans erreur observée. Tests effectués sur une origine locale distincte (4249), sans toucher aux notes du navigateur sur 4242. Le dépôt principal était propre avant intégration. La publication repose sur le push de main et le déploiement automatique Vercel ; vérifier leur état pour connaître la version publique actuelle.

Axeptio reste suspendu à la demande de Teo. Ne pas reprendre la branche de consentement dans ce chantier de branding.

## 2026-09-12 — Laboratoire Trou noir / composant React

Demande de Teo : intégrer black-hole.tsx avec React, TypeScript, Tailwind et conventions shadcn. L’extrait ne fournissait pas black-hole-utils/renderer : moteur original implémenté, avec un rendu illustratif déclaré. Branche codex/black-hole depuis 51089de, worktree isolé the42laws-black-hole. Aucun remplacement du site statique.

Livraison : /trou-noir/, composant réutilisable et démo source dans components/ui ; 7e entrée de l’atlas ; calcul rₛ, palettes ambre/cobalt, angle, zoom, luminosité, disque visible/masqué, pause initiale et plein écran. Repli illustré sans WebGL, pause hors écran/page cachée, nettoyage GPU/observateurs au démontage. Réduction du mouvement prise en compte. Données de contrôle locales à la page ; carnet existant préservé. Documentation d’installation et limites dans REACT_COMPONENTS.md. Les sources TSX et les outils de travail ne sont pas copiés dans le paquet public.

Vérifications locales : TypeScript strict ; 49 tests (44 précédents + rayon/entrées/import et deux tests de cycle de vie) ; build public 163 fichiers, 1451 liens/ressources, 20 routes au sitemap et 42 dossiers statiques. Navigateur : rendu WebGL et changement de palette/angle, lecture/pause, plein écran, bornes clavier, réinitialisation, passage 10 → 20 masses solaires (29,53 → 59,07 km), 4 millions (11 813 358 km). Pages testées à 320/390/768 pixels et format ordinateur, sans débordement observé. Repli WebGL réellement exercé dans un fixture local ignoré, avec calculateur restant fonctionnel. Console sans erreur observée. Lien depuis les sept cartes de laboratoires validé.

Serveur de test sur 4251. Après fusion, lancer npm ci dans le dossier principal et redémarrer le serveur 4242 pour activer le nouveau pipeline. La livraison distante doit être distinguée des contrôles locaux : vérifier GitHub Actions, Vercel et les assets publics du commit après push. Ne pas reprendre Axeptio.

## 2026-09-12 — Intégration Gateway Flow

Demande : intégrer le composant joint au bon endroit. Travail sur codex/gateway-flow, worktree the42laws-gateway-flow depuis e61d084. Emplacement retenu : ouverture des Parcours guidés, accessible par le bouton « Par où commencer ? » de l’accueil. Effet Bézier/particules adapté en canvas React direct ; source et démo dans components/ui. Pas d’authentification ajoutée ni de dépendances externes au chargement. Documentation dans REACT_COMPONENTS.md.

Contrôles navigateur : rendu ordinateur et mobile 320/390 px, sans débordement à 320 px ; pause/reprise, parcours matière (six étapes), retour vers les quatre itinéraires. Canvas démonté à la navigation puis monté une seule fois au retour. Préférence de mouvement réduit gérée dans le composant et le montage. Serveur temporaire 4253 ; publication via main à vérifier avec CI, Vercel et lecture des assets distants. Axeptio reste suspendu.

Validation locale Gateway : TypeScript strict, 49 tests réussis, paquet public de 164 fichiers / 1451 liens et ressources / 42 dossiers. Navigation depuis l’accueil testée ; aucune erreur console observée.

## 2026-09-12 — Footer éditorial The42laws

Demande : intégrer le footer joint avec un design soigné et adapté à The42laws. Branche codex/footer-design depuis 079b49d, worktree the42laws-footer. Composition avec invitation, trois groupes de liens, grande signature typographique et retour en haut. Huit entrées HTML partagent le rendu React statique ; le build des dossiers reprend ce shell. Motion remplacé par CSS/IntersectionObserver pour ne pas charger React dans toutes les pages ; préférences de mouvement réduit respectées. Aucune dépendance ajoutée. Source et fonctionnement dans REACT_COMPONENTS.md.

Validation : TypeScript et 49 tests réussis ; première construction publique vérifiée (165 fichiers / 2271 liens et ressources / 42 dossiers). Correction d’une règle mobile « nav a:first-child » qui masquait les liens dans Neutrino. Les sept laboratoires contrôlés à 320 px : un seul footer, douze liens de navigation visibles, aucun débordement horizontal. Rendus ordinateur 1280, tablette 768, mobile 390 vérifiés. Navigation réelle du footer d’un laboratoire vers Notre méthode ; retour en haut conserve la route. Prévisualisation temporaire port 4254 ; publication via main à vérifier avec GitHub Actions et Vercel. Axeptio suspendu.

## 2026-09-12 — Hero trou noir optimisée

Demande : meilleure hero dans le style du composant optimized-black-hole fourni. Branche codex/black-hole-hero depuis ed0e74d, worktree the42laws-hero. Moteur de l’extrait absent : adaptation du moteur du laboratoire avec budget dédié, sans changer les réglages du laboratoire. Composition sombre, titre sérif, deux CTA existants et lien vers le laboratoire. Sur mobile, scène sous les boutons. Poster fixe et boutons utilisables si WebGL ne peut pas démarrer ; contrôle d’animation masqué dans ce cas. Aucun changement de dépendance, Analytics, Axeptio ou carnet.

Validation locale : TypeScript strict, 50 tests réussis (dont budget de rendu accueil et conservation de celui du laboratoire), paquet public 166 fichiers / 2271 liens et ressources / 42 dossiers. Navigation accueil → parcours : canvas du trou noir démonté. Pause réelle testée. Repli WebGL exercé via fixture locale ignorée : canvas transparent, poster chargé, aucun contrôle trompeur. Réduction du mouvement simulée dans une seconde fixture : rendu fixe et aucun bouton d’animation. Serveur temporaire 4255 ; vérifier CI/Vercel et les assets distants après publication.

Compléments de validation : formats 320/390/768 et ordinateur contrôlés sans débordement ; liens vers l’atlas et les parcours testés, retour avec un seul canvas. Dans la fixture de mouvement réduit, le compteur de dessins reste à 3 entre les deux lectures espacées : aucun dessin animé supplémentaire. Console sans erreur observée. Les fixtures restent dans artifacts/, ignorées et absentes du paquet public.

## 2026-09-12 — Enrichissement IA et mathématiques

Demande : reprendre les informations et idées pertinentes de la transcription fournie. Branche codex/ia-mathematiques, worktree the42laws-ia-mathematiques, base 013fcbf. Synthèse originale, sans reproduction de la transcription ni reprise des chiffres incertains. Dix idées dans 41 ; prolongements 23/36 ; huit définitions, quatre connexions, six références documentées ; méthode enrichie. Les opinions et annonces sont distinguées des démonstrations. Aucune modification Analytics, Axeptio ou carnet.

Validation locale : TypeScript, 50 tests réussis ; contrôle de recherche étendu à l’alias Lean ; 166 fichiers publics et 2281 liens/ressources. Navigation réelle recherche Lean → dossier 41 → définition interactive → dossier complet ; dix titres et six nouvelles lignes de références visibles. Glossaire à 390 px sans débordement ; console sans erreur. Prévisualisation du paquet sur 4256. Publication distante à vérifier après push de main.


## 2026-09-12 — Enrichissement origine de la vie

Demande : extraire les informations pertinentes de la transcription sur le vivant. Branche codex/origines-vie depuis f5c5c86, worktree the42laws-origines-vie. Trois nouvelles synthèses 33/34/35 et approfondissement de 32, quatre résumés actualisés, nouveau parcours en quatre étapes, 14 définitions, cinq connexions et neuf références. Texte original reformulé ; les chiffres non vérifiés et l’affirmation d’une origine inévitable ne sont pas repris. Aucune relecture scientifique indépendante revendiquée.

Validation locale : 50 tests réussis et TypeScript strict. Navigation parcours → dossier 33 → définition Protocellule → texte complet et sept références ; dossiers 34/35 et tableaux à 320 px sans débordement, références à 390 px. Recherche « abiogenese » sans accents renvoie 32/33/34. Console sans erreur observée. Correction de deux alias abusifs : Miller/Bennu ne doivent pas afficher la définition de molécule organique. Prévisualisation temporaire sur 4257. Publication par main à vérifier avec CI, Vercel et lecture des pages publiques après push. Aucun changement Analytics, Axeptio ou carnet.


## 2026-09-12 — Famille de pictogrammes de navigation

Demande : améliorer les neuf icônes de la capture pour mieux incarner la marque. Branche codex/nav-icons depuis 56a9909 ; SVG bicolores originaux sur grille commune, verre cobalt, états actif/survol/focus, zones de 48 px. Changements limités à atlas/app.js et atlas/brand.css, plus documentation. Aucun changement du contenu ni du carnet.

Validation locale : 50 tests réussis, syntaxe JavaScript, build public et contrôle de 166 fichiers / 2300 liens et ressources. Rendu ordinateur 1440 et menu mobile 390 px observés ; neuf liens et SVG présents, navigation Laboratoires puis Glossaire, état actif correct. À 320 px, fermeture Échap rend le focus au bouton de menu ; aucun débordement horizontal ni erreur console observés. Prévisualisation temporaire 4258. Vérifier CI, Vercel et lecture distante après push pour établir la publication.
