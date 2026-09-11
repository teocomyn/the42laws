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

`index.html` et les deux laboratoires peuvent aussi être ouverts directement. Les fichiers générés sont inclus dans Git ; aucune installation n’est nécessaire pour cette consultation. La disponibilité du stockage personnel en mode fichier dépend du navigateur.

## La V1

- Accueil avec carte interactive des 42 questions et accès aux expériences.
- Atlas : recherche insensible aux accents, filtres par domaine et état de recherche.
- Lecteur : question 41 en trois vues, l’essentiel, le dossier original et ses références. Les autres fiches indiquent honnêtement « À explorer ».
- Laboratoires [Neutrino](neutrino/index.html) et [Antimatière](antimatiere/index.html), avec navigation vers l’atlas.
- Trois parcours guidés : matière, temps et connaissance. Ils incluent des dossiers encore à construire.
- Carnet personnel : favoris, lectures marquées manuellement, notes et export JSON. Données locales à ce navigateur et à cette adresse ; pas de synchronisation ni d’import dans cette version. Effacer les données du navigateur efface le carnet : l’export permet de conserver une copie.
- Méthode et registre des sources consultables dans l’interface.

La progression de lecture est personnelle. Elle ne change jamais le statut scientifique d’un dossier. L’ouverture d’un laboratoire dans un parcours indique seulement qu’il a été ouvert.

## Écrire et construire

Les Markdown restent la source de vérité des recherches :

- [QUESTIONS.md](QUESTIONS.md) : sommaire de référence.
- [questions/](questions/) : les 42 fiches ; conserver titres, numéros et champs de statut.
- [METHODE.md](METHODE.md) : cadre de rédaction.
- [sources/README.md](sources/README.md) : références et modes de consultation.
- [content/atlas.json](content/atlas.json) : domaines, liens pédagogiques et parcours.
- [content/41-essentiel.md](content/41-essentiel.md) : lecture courte de la question 41, distincte de la recherche originale.
- [atlas/](atlas/) : interface statique HTML/CSS/JavaScript. `data.js` est généré, ne pas l’éditer à la main.

```sh
npm run build
npm test
```

Marked est une dépendance de construction uniquement. Le navigateur ne charge aucune bibliothèque ou police distante. Le rendu échappe le HTML brut des Markdown et filtre les protocoles des liens. Les tests couvrent l’intégrité de l’atlas, la recherche, les états enregistrés, le rendu Markdown et les deux modèles physiques.

## État de la recherche

La fiche 41 est une **synthèse provisoire**, accompagnée de 57 références dont les niveaux de consultation diffèrent. Sa vue courte précise la portée des résultats et sépare limites démontrées sous hypothèses, extrapolations et conjectures. Le dossier original est conservé ; il n’a pas été intégralement validé par un tiers.

Les 41 autres fiches restent « À explorer ». Les deux laboratoires sont des outils pédagogiques sourcés ; ils ne résolvent pas les questions fondamentales du programme. Les prochains développements peuvent approfondir les dossiers ou ajouter des expériences dans ce cadre commun.
