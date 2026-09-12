# The42laws — Contexte du projet

Mis à jour : 2026-09-12

## Objet

Carnet de recherche en français à partir des 42 questions fournies par Teo, réparties en sept domaines. Finalité : tenter de construire des réponses argumentées et révisables.

## Classification et architecture

Projet de contenu et de recherche local avec atlas statique à la racine et six laboratoires intégrés, dont Navier-Stokes et Relativité. Les Markdown restent la source de vérité. Construction par scripts/build-atlas.mjs (Marked 18.0.12, dépendance de développement), données générées dans atlas/data.js. Dépôt source GitHub : https://github.com/teocomyn/the42laws (public, branche main ; envoi autorisé par Teo le 2026-09-12). Projet Vercel the42laws dans t4c2s-projects, relié à main. Première tentative échouée (dossier public absent) ; correction versionnée dans vercel.json : npm run build:public puis check:public, sortie build/public, Node 22.x. Aucun service applicatif distant. Serveur local facultatif : npm run dev. Dépôt Git initialisé le 2026-09-12, premier instantané 53642f3.

## Structure

- index.html, atlas/ : accueil, recherche des 42 questions, lecteur, parcours et carnet local.
- content/ : résumés prudents des onze synthèses, métadonnées, particules, glossaire et liens éditoriaux.
- photon/, temps/ : nouveaux modèles de la V2 ; tests/v2.test.cjs.
- PUBLICATION.md, scripts/build-public.mjs : site autonome dans build/public, sans publication.
- Branche de finalisation isolée : codex/atlas-v2 ; copie intégrée au dossier principal après comparaison des fichiers.
- scripts/ : construction et serveur local ; package.json : build/dev/test.
- README.md : entrée du projet et instructions de lancement.
- QUESTIONS.md : sommaire des 42 questions avec statuts.
- METHODE.md : cadre de recherche.
- questions/01.md à questions/42.md : fiches individuelles.
- notes/ : notes datées sur des événements en cours (navier-stokes-2026.md).
- navier-stokes/ : laboratoire pédagogique sur les équations de Navier-Stokes (Claude Code, 2026-09-12) ; tests/navier-stokes.test.cjs ; intégré dans content/atlas.json.
- sources/README.md : registre des références vérifiées (S001 à S165 : neutrino S001-S008, antimatière S009-S016, question 41 S017-S073, question 23 S074-S139, note Navier-Stokes S140-S165 ; atlas V2 S200-S211).
- neutrino/ : laboratoire pédagogique sur le neutrino (Codex, 2026-09-11) ; tests/physics.test.cjs.
- antimatiere/ : laboratoire pédagogique sur l’antimatière avec notes scientifiques (Codex, 2026-09-12) ; tests/antimatter.test.cjs.

## Principes de travail

Conserver les 42 questions et leur numérotation. Distinguer résultats empiriques, modèles, arguments philosophiques et conjectures personnelles. Vérifier les références avant citation, indiquer le mode de consultation (texte, résumé, bibliographie seule) et rendre explicites les incertitudes. Le nom The42laws ne constitue pas une revendication de 42 lois démontrées.

## Décisions

- 2026-09-11 : cadre documentaire et ordre de traitement proposés par l’assistant (commencer par 01).
- 2026-09-12 : à la demande de Teo, la première synthèse porte sur la question 41, choisie initialement pour ses liens avec des théorèmes de limitation ; l’ordre « 01 d’abord » n’est plus la règle. Tri de travail retenu : 41 answerable ; 23 traitée en second parce que la fiche 41 en fournit la clé (sens (c)) ; 10, 19, 26, 29, 32 partiellement answerable ; les autres ouvertes.
- 2026-09-12 : deux outils ont écrit simultanément dans le dossier (Codex : antimatière ; Claude : fiche 41). Les identifiants de sources ont été renumérotés et la section de reprise antimatière reconstruite. Règle rappelée : un seul outil à la fois sur le même arbre.
- 2026-09-12 : V1 de l’atlas autorisée par Teo et développée. La classification précédente « answerable » est une orientation de travail, pas une preuve que seule la question 41 admet des résultats démontrés. Dossier original conservé ; lecture courte avec réserves et sources séparées.
- Les contributions originales (synthèses, dérivations, conjectures) sont admises si elles sont signalées comme telles dans la fiche.

## Jalon actuel

Onze synthèses provisoires, six laboratoires et quatre parcours (voir le jalon Lot 3 ci-dessous). Carnet enregistré dans localStorage (the42laws:v1), sans synchronisation. Les statuts de lecture et de recherche sont distincts ; import avec aperçu et fusion non destructive par défaut, export JSON. Site publié sur Vercel avec déploiement automatique de main. Domaine principal : https://the42laws.fr ; www redirige en 308 vers le domaine principal. DNS chez Hostinger. La construction définit SITE_URL=https://the42laws.fr. Voir AI_HANDOFF.md pour distinguer les validations locales et distantes de chaque livraison.


## 2026-09-12 — Lots 1 et 2

Huit synthèses provisoires : 10, 15, 19, 23, 25, 26, 30 et 41 ; 34 fiches à explorer. Cinq laboratoires intégrés, dont Navier-Stokes 2D. Trois parcours complets dans leurs étapes obligatoires ; la question 42 est un prolongement facultatif. Les Markdown restent la source, avec content/learning.json pour les repères pédagogiques et la transparence éditoriale. Aucune relecture scientifique humaine indépendante n’est revendiquée.

Adresses de dossiers : /dossiers/{id}/, texte complet et sources présents dans le HTML public, même shell interactif. Reprise des liens historiques #/question/{id}, conservation du carnet the42laws:v1. Les fiches sans synthèse portent noindex et sont hors sitemap. Les pages nécessitent un hébergement à la racine du domaine.

Chaque laboratoire propose un guide : prédiction, manipulation, relevés A/B, explication, export JSON. Ces réponses sont temporaires dans la page et ne sont pas ajoutées au carnet. Navier démarre en pause ; son schéma auto-similaire et les forces visuelles restent explicitement distincts d’une preuve ou d’une simulation physique rigoureuse en 3D. CI GitHub : build, tests, liens/ancres locaux, cohérence du fichier généré. Axeptio est mis de côté à la demande explicite de Teo ; la branche séparée codex/analytics-consent reste non fusionnée. Ne pas reprendre ce chantier sans nouvelle demande.


## 2026-09-12 — Lot 3

Onze synthèses provisoires : ajout des dossiers 1 (existence), 32 (vie) et 36 (conscience), avec sources S320–S325 et exercices de réflexion. Six laboratoires : relativite/ compare les durées propres d’un aller-retour idéal à vitesse constante sur deux segments, sans gravitation et avec demi-tour instantané. Sources S326–S327. Le parcours temps inclut cette expérience ; nouveau parcours « Exister, vivre, ressentir » pour les trois synthèses, sans implication démontrée entre elles. Quatre parcours, 31 fiches à explorer. L’import du carnet accepte désormais relativite et conserve la version 1. Axeptio est suspendu selon la demande de Teo.

## Identité — favicon

2026-09-12 : favicon commun « 42 » blanc sur verre irisé, créé selon la référence de Teo avec image_gen. Master atlas/logo-42.png ; déclinaisons favicon-42-{16,32,48,180,512}.png et favicon.ico. Fond charbon opaque. Toutes les pages, y compris les laboratoires, partagent ces icônes ; aucun changement du logotype dans l’interface.

## 2026-09-12 — Branding cobalt et verre

Identité commune documentée dans BRANDING.md : couverture ivoire/cobalt, symbole original à sept couches, textures de points, six illustrations de laboratoires et cartes éditoriales. Le logo 42 irisé est conservé et utilisé dans la navigation. Couche atlas/brand.css commune aux sept entrées HTML et aux dossiers générés. Carte sociale atlas/brand-share.png (1200 × 630), source SVG versionnée. Les références fournies restent des inspirations ; aucun média de référence n’est publié. Aucun changement des modèles scientifiques, des données ou du stockage du carnet. Aucune dépendance de production ajoutée.
