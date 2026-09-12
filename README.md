# The42laws

Un atlas de recherche en français pour explorer 42 questions sur l’existence, la réalité, la physique, l’Univers, la vie, la conscience, la liberté, la connaissance et le sens. Le nom ne présume pas l’existence de « 42 lois » démontrées.

## Ouvrir l’atlas

Avec Node.js 22 ou plus récent :

```sh
npm ci
npm run dev
```

Ouvrir http://127.0.0.1:4242/. Si le port est occupé, ouvrir le serveur existant ou lancer `PORT=4243 npm run dev`.

Le serveur est local, lié à 127.0.0.1. Il reconstruit les données lors de modifications des recherches ; rafraîchir ensuite le navigateur. Aucun compte, service distant ou déploiement n’est nécessaire.

`index.html` et les laboratoires peuvent aussi être ouverts directement. Les fichiers générés sont inclus dans Git ; aucune installation n’est nécessaire pour cette consultation. La disponibilité du stockage personnel en mode fichier dépend du navigateur.

## La V2

- Accueil avec carte interactive des 42 questions et accès aux expériences.
- Atlas : recherche insensible aux accents, filtres par domaine et état de recherche.
- Lecteur : dossiers 10, 15, 23 et 41 en trois vues (essentiel, dossier, sources). Les 38 autres fiches indiquent « À explorer ».
- Quatre laboratoires dans l’atlas : [Neutrino](neutrino/index.html), [Antimatière](antimatiere/index.html), [Photon & double fente](photon/index.html), [Temps & entropie](temps/index.html).
- Tableau des particules : 17 entrées, filtres par famille, propriétés et liens vers les expériences.
- Glossaire : 15 définitions, recherche et consultation au clic dans les dossiers. Carte de 37 liens éditoriaux entre les 42 questions.
- Trois parcours guidés : matière, temps et connaissance. Ils incluent des dossiers encore à construire.
- Carnet personnel : favoris, lectures marquées manuellement, notes, export et import JSON avec aperçu et choix de résolution des conflits. Les notes existantes sont conservées par défaut. Données locales à ce navigateur et à cette adresse ; pas de synchronisation. Effacer les données du navigateur efface le carnet : l’export permet de conserver une copie.
- Méthode et registre des sources consultables dans l’interface.

La progression de lecture est personnelle. Elle ne change jamais le statut scientifique d’un dossier. L’ouverture d’un laboratoire dans un parcours indique seulement qu’il a été ouvert.

## Écrire et construire

Les Markdown restent la source de vérité des recherches :

- [QUESTIONS.md](QUESTIONS.md) : sommaire de référence.
- [questions/](questions/) : les 42 fiches ; conserver titres, numéros et champs de statut.
- [METHODE.md](METHODE.md) : cadre de rédaction.
- [sources/README.md](sources/README.md) : références et modes de consultation.
- [content/atlas.json](content/atlas.json) : domaines, liens pédagogiques et parcours.
- `content/*-essentiel.md` : lectures courtes, distinctes des recherches originales.
- `content/particles.json`, `glossary.json`, `connections.json` : données pédagogiques de la V2.
- [atlas/](atlas/) : interface statique HTML/CSS/JavaScript. `data.js` est généré, ne pas l’éditer à la main.

```sh
npm run build
npm test
```

Marked est une dépendance de construction uniquement. Le navigateur ne charge aucune bibliothèque ou police distante. Le rendu échappe le HTML brut des Markdown et filtre les protocoles des liens. Les tests couvrent l’intégrité de l’atlas, la recherche, les états enregistrés, le rendu Markdown et les modèles physiques ; l’import est validé et le paquet public peut être contrôlé avec `npm run check:public`.

## État de la recherche

La fiche 41 est une **synthèse provisoire**, accompagnée de 57 références dont les niveaux de consultation diffèrent. Sa vue courte précise la portée des résultats et sépare limites démontrées sous hypothèses, extrapolations et conjectures. Le dossier original est conservé ; il n’a pas été intégralement validé par un tiers.

La fiche 23 (théorie du tout) est également en **synthèse provisoire** (66 références, réponse en quatre sens). Une [note datée](notes/navier-stokes-2026.md) suit l’annonce d’OpenAI du 8 septembre 2026 sur Navier-Stokes, accompagnée d’un [laboratoire interactif](navier-stokes/index.html) (fluide 2D à manipuler, schéma de l’explosion, énoncés du prix Clay ; pas encore relié à l’atlas). Les fiches 10 (temps) et 15 (constituants) disposent également d’une première synthèse pédagogique sourcée ; 38 fiches restent « À explorer ». Les laboratoires sont des outils pédagogiques sourcés ; ils ne résolvent pas les questions fondamentales du programme. Les prochains développements peuvent approfondir les dossiers ou ajouter des expériences dans ce cadre commun.


## Version publiable

```sh
npm run package:public
npm run check:public
```

Le site autonome est généré dans `build/public/`, avec 42 pages de questions lisibles sans JavaScript sous `/dossiers/`. L’archive `artifacts/the42laws-v2-public.zip` peut être remise à un hébergeur. Aucun domaine ni déploiement n’est configuré : voir [PUBLICATION.md](PUBLICATION.md) pour les URL canoniques, le sitemap et la prévisualisation du paquet.

Le laboratoire Navier-Stokes, créé séparément, est conservé dans le paquet comme contenu existant ; il reste en dehors des quatre entrées de laboratoire de l’atlas V2.
