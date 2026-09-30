# Publication de The42laws

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

## Domaine de production

Le domaine choisi par Teo est `https://the42laws.fr`. La commande de construction dans vercel.json fournit cette valeur à SITE_URL pour générer les canoniques, le sitemap et les images de partage. Le domaine reste enregistré chez Hostinger ; www.the42laws.fr redirige vers le domaine principal dans Vercel. Pour une construction locale identique : `SITE_URL=https://the42laws.fr npm run build:public`.

Cette option ajoute les URL canoniques, le sitemap et les métadonnées de partage avec image absolue. Sans domaine, ces éléments absolus sont volontairement omis. Le fichier `_headers` fournit des en-têtes pour les hébergeurs compatibles ; les autres devront les configurer selon leur documentation.

La publication consiste à servir le contenu de `build/public/`, en conservant les répertoires et leurs fichiers `index.html`. Aucun serveur applicatif ni base de données n’est nécessaire. Vérifier alors les URL publiques, le partage, les retours vers l’atlas et un export/import sur la nouvelle origine.

## Périmètre éditorial

Les fiches 10, 15, 19, 23, 25, 26, 30 et 41 sont provisoires. Les vues courtes précisent leurs limites. Les textes historiques et le registre conservent leurs niveaux de consultation ; une référence n’implique pas une lecture intégrale. Le paquet ne constitue pas une validation exhaustive des recherches.

## Google Analytics

La construction avec `SITE_URL` configure l’identifiant GA4 `G-L659XPNBR6` dans un unique script local `atlas/consent.js`. Ce script ne charge Google qu’après acceptation explicite ; refus et acceptation ont la même visibilité. Le choix est mémorisé au maximum 180 jours, séparément du carnet, puis redemandé. Le bouton Cookies du footer permet de le modifier. Le retrait désactive GA, retire les cookies `_ga` accessibles et recharge la page pour arrêter le code Google déjà chargé. Axeptio reste absent.

Ce mode est un blocage préalable (« basic consent mode »), sans pings Google avant consentement. Les quatre signaux de Consent Mode sont définis avant la configuration ; seuls les signaux Analytics peuvent devenir accordés. Signaux Google et personnalisation publicitaire sont désactivés. L’aperçu source sans `SITE_URL` ne charge jamais Google. Search Console est conservée.

Un `page_view` explicite suit les pages publiques, après mise à jour des métadonnées. Les recherches, filtres, fragments libres, carnet et réponses sont exclus des paramètres construits par le site ; referrer et URL sont expurgés. **Dans la propriété GA4**, désactiver la mesure améliorée (notamment historique, recherche et formulaires) pour éviter tout événement automatique concurrent ; ne pas ajouter de seconde balise via GTM. La présence et le réglage de la propriété distante n’ont pas été confirmés par ce chantier local. Vérifier le réseau puis DebugView après la prochaine publication, sans transmettre de réponses personnelles.

Les pages `/confidentialite/` et `/mentions-legales/` sont générées avec le site et liées dans tous les footers. Compléter `content/legal.json` avec l’identité, le responsable de publication, l’adresse adaptée au statut, le contact public, l’immatriculation si applicable et la conservation réellement choisie dans GA4. Aucun renseignement privé de l’historique n’est publié par défaut. Les mentions restent marquées comme brouillon et noindex tant que les informations éditoriales ne sont pas renseignées ; cette préparation ne vaut pas validation juridique complète.

Références consultées le 30 septembre 2026 : [CNIL — mesure d’audience](https://www.cnil.fr/fr/mesurer-la-frequentation-de-vos-sites-web-et-de-vos-applications), [Google — Consent Mode](https://developers.google.com/tag-platform/security/guides/consent).

## Lecture et contrôles — lots 1 et 2

Le dossier complet, ses sources et les outils interactifs utilisent la même adresse `/dossiers/{id}/`. Le texte est disponible dans le HTML même sans JavaScript. Les variantes de lecture gardent une URL canonique commune. Les liens à fragments historiques migrent côté navigateur, sans modifier les notes enregistrées. Les 28 fiches sans synthèse ne sont pas dans le sitemap et portent noindex,follow.

GitHub Actions vérifie les tests, la construction et les ressources/ancres locales à chaque PR et push sur main. Les sources externes restent un contrôle éditorial daté, sans réseau obligatoire dans la CI. Un changement du domaine exige une mise à jour de SITE_URL. Le site est servi à la racine de son domaine, pas dans un sous-répertoire.

Axeptio reste suspendu. Le chantier du 30 septembre remplace le chargement immédiat historique de GA par le choix natif décrit ci-dessus.

## Carnet des expériences — 30 septembre 2026

Les sept guides enregistrent automatiquement prédiction, explication, réglages et relevés A/B dans `the42laws:v1`, avec un format version 2. La clé reste identique pour préserver les carnets précédents. Une expérience par guide est conservée ; de nouveaux relevés remplacent le créneau A ou B. Le carnet affiche les observations et permet la reprise. Les paramètres sont restaurés, sans prétendre rejouer l’état exact du fluide, les impacts, les urnes ou leurs historiques.

L’export complet inclut toutes les expériences. L’export d’un guide contient uniquement cette expérience au format carnet ; il peut être fusionné depuis le carnet. Les exports version 1 et les anciens exports autonomes des guides restent acceptés. Le choix de conflit s’applique aux notes et expériences ; les données actuelles sont gardées par défaut. Un stockage bloqué est signalé ; l’export reste disponible.
