# Préparer la publication de The42laws

La V2 est autonome et statique. Le dépôt inclut les réglages Vercel depuis le 2026-09-12, à la demande de Teo après une première tentative de déploiement échouée.

## Déployer sur Vercel

Importer `teocomyn/the42laws`, branche `main`, à la racine du dépôt. `vercel.json` configure le preset Other, `npm ci`, la construction `npm run build:public && npm run check:public` et le dossier de sortie `build/public`. Node.js est fixé à la version majeure 22 dans package.json. Les URL de répertoires conservent leur barre finale pour les ressources relatives des laboratoires.

L’ancien commit 8e76010 ne contient pas cette configuration : après un échec, lancer un déploiement du dernier commit de main, plutôt que reconstruire ce commit ancien. Seul build/public est servi, pas les fichiers de travail du dépôt.

## Construire la version à héberger

```sh
npm ci
npm run build:public
npm run package:public
```

`build/public/` contient les fichiers à héberger. `artifacts/the42laws-v2-public.zip` est une archive de ce répertoire ; la commande de packaging utilise l’utilitaire `zip` de macOS. Le fichier `publication.json` précise le contenu livré.

Seuls les actifs du site et les textes de recherche sont inclus. Le dossier Git, les dépendances, les fichiers AI_CONTEXT/AI_HANDOFF, les fichiers de travail et les carnets personnels ne font pas partie du paquet.

## Prévisualiser exactement le paquet

```sh
python3 -m http.server 4245 --bind 127.0.0.1 --directory build/public
```

Ouvrir http://127.0.0.1:4245/. Vérifier aussi `/dossiers/`, `/dossiers/15/`, `/photon/` et `/temps/`. Les pages `/dossiers/1/` à `/dossiers/42/` possèdent un contenu statique lisible sans JavaScript. Elles renvoient au lecteur interactif pour les notes et les sources détaillées.

Le carnet appartient à l’origine du navigateur : changer d’adresse ou de port crée un espace distinct. Exporter depuis l’ancienne adresse puis importer sur la nouvelle permet de réunir ses données. L’import conserve par défaut les notes existantes en cas de conflit.

## Quand un domaine sera choisi

Relancer la construction avec `SITE_URL` égal à l’adresse HTTPS réelle de base, terminée ou non par `/`. La variable doit être fournie par l’utilisateur ou l’hébergement ; aucune adresse n’est inventée dans le code.

Cette option ajoute les URL canoniques, le sitemap et les métadonnées de partage avec image absolue. Sans domaine, ces éléments absolus sont volontairement omis. Le fichier `_headers` fournit des en-têtes pour les hébergeurs compatibles ; les autres devront les configurer selon leur documentation.

La publication consiste à servir le contenu de `build/public/`, en conservant les répertoires et leurs fichiers `index.html`. Aucun serveur applicatif ni base de données n’est nécessaire. Vérifier alors les URL publiques, le partage, les retours vers l’atlas et un export/import sur la nouvelle origine.

## Périmètre éditorial

Les fiches 10, 15, 23 et 41 sont provisoires. Les vues courtes précisent leurs limites. Les textes historiques et le registre conservent leurs niveaux de consultation ; une référence n’implique pas une lecture intégrale. Le paquet ne constitue pas une validation exhaustive des recherches.
