# The42laws — Contexte du projet

Mis à jour : 2026-09-12

## Objet

Carnet de recherche en français à partir des 42 questions fournies par Teo, réparties en sept domaines. Finalité : tenter de construire des réponses argumentées et révisables.

## Classification et architecture

Projet de contenu et de recherche local avec atlas statique à la racine et quatre laboratoires intégrés, plus le module Navier-Stokes autonome. Les Markdown restent la source de vérité. Construction par scripts/build-atlas.mjs (Marked 18.0.12, dépendance de développement), données générées dans atlas/data.js. Dépôt source GitHub : https://github.com/teocomyn/the42laws (public, branche main ; envoi autorisé par Teo le 2026-09-12). Aucun hébergement du site ni service applicatif distant configuré. Serveur local facultatif : npm run dev. Dépôt Git initialisé le 2026-09-12, premier instantané 53642f3.

## Structure

- index.html, atlas/ : accueil, recherche des 42 questions, lecteur, parcours et carnet local.
- content/ : résumés prudents 10/15/23/41, métadonnées, particules, glossaire et liens éditoriaux.
- photon/, temps/ : nouveaux modèles de la V2 ; tests/v2.test.cjs.
- PUBLICATION.md, scripts/build-public.mjs : site autonome dans build/public, sans publication.
- Branche de finalisation isolée : codex/atlas-v2 ; copie intégrée au dossier principal après comparaison des fichiers.
- scripts/ : construction et serveur local ; package.json : build/dev/test.
- README.md : entrée du projet et instructions de lancement.
- QUESTIONS.md : sommaire des 42 questions avec statuts.
- METHODE.md : cadre de recherche.
- questions/01.md à questions/42.md : fiches individuelles.
- notes/ : notes datées sur des événements en cours (navier-stokes-2026.md).
- navier-stokes/ : laboratoire pédagogique sur les équations de Navier-Stokes (Claude Code, 2026-09-12) ; tests/navier-stokes.test.cjs ; pas encore dans content/atlas.json.
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

Fiches 10 et 15 (4 sources chacune), 23 (66 sources) et 41 (57 sources) en « Synthèse provisoire ». Les 38 autres restent « À explorer ». V2 : quatre laboratoires dans l’atlas, tableau des particules, glossaire, carte de liens et parcours enrichis. Carnet enregistré dans localStorage (the42laws:v1), sans synchronisation. Les statuts de lecture et de recherche sont distincts. Import avec aperçu et fusion non destructive par défaut, export JSON. Paquet publiable préparé à la demande de Teo, sans mise en ligne. Voir AI_HANDOFF.md pour les validations de la V2.
