# The42laws — référencement et découverte dans les réponses IA

## Lot du 30 septembre 2026

Le contenu essentiel est servi directement en HTML : accueil, 42 dossiers, sept domaines, cinq parcours, catalogue des laboratoires, glossaire, particules, liens, méthode, sources et présentation du projet. La hero et les animations enrichissent ce contenu après chargement. Les anciens liens `/#/…` sont repris par le routeur ; les liens publics du HTML pointent vers les adresses permanentes.

45 URL sont inscrites au sitemap : les 15 dossiers disposant d’une synthèse, les sept laboratoires, les pages de découverte et la confidentialité. Les 27 dossiers encore vides et les mentions légales incomplètes restent en `noindex`, hors sitemap. Les résultats d’une recherche interne sont en `noindex` dans le routeur, avec une canonique vers la page de référence. Les filtres ne créent pas de pages supplémentaires dans le sitemap.

Les métadonnées et le JSON-LD sont partagés entre le HTML construit et le routeur. Types utilisés : WebSite, WebPage, CollectionPage, BreadcrumbList. Aucun auteur scientifique, qualification, avis ou validation indépendante n’est ajouté. Les dates de révision viennent des fiches de lecture, pas de la date de construction. Le sitemap n’ajoute pas de `lastmod` artificiel.

Les liens vers les sources, les réserves, les explications et les niveaux de consultation restent visibles. La méthode indique que les synthèses sont assistées par IA et provisoires. Les en-têtes de sécurité sont configurés dans Vercel ; `_headers` est conservé pour les hébergements qui l’interprètent.

## Mesurer après publication

| Besoin | URL principale | Preuve locale disponible | Mesure distante à collecter |
|---|---|---|---|
| Comprendre l’origine de la vie | /dossiers/origine-vie-abiogenese/ | Synthèse, limites, références, liens vers 32/34/35 | Inspection GSC puis requêtes, impressions et clics |
| Comprendre la flèche du temps | /dossiers/temps-entropie-fleche-du-temps/ | Texte complet et lien vers l’expérience | Inspection GSC et pages d’entrée |
| Comprendre les limites de la connaissance | /dossiers/limites-connaissance-godel-turing/ | Résultats sous hypothèses, références, glossaire | Requêtes hors marque et citations observées |
| Découvrir les domaines | /domaines/vie/ et les six autres | Page HTML, liste de dossiers, fil d’Ariane | Indexation effective et navigation vers les dossiers |
| Apprendre avec un parcours | /parcours/origines-vie/ et les quatre autres | Étapes et liens directs lisibles sans JavaScript | Entrées organiques et progression consentie |
| Comprendre un terme | /glossaire/ | Toutes les définitions et liens vers les dossiers | Requêtes de définition et clics vers les dossiers |

1. Envoyer ou vérifier `https://the42laws.fr/sitemap.xml` dans la propriété Search Console exacte. Inspecter l’accueil, un domaine, un parcours et les dossiers 10/29/33/41. Vérifier la canonique choisie par Google et le HTML exploré. Une réponse HTTP 200 et une canonique proposée ne prouvent pas l’indexation.
2. Collecter les 90 derniers jours complets disponibles dans GSC, puis la période précédente comparable. Séparer requêtes de marque et hors marque. Aucun trafic ou gain n’a été mesuré dans ce lot.
3. Dans GA4, vérifier la conservation et désactiver les événements automatiques de mesure améliorée pouvant doubler les événements manuels ou inclure les recherches. Valider en DebugView les pages publiques après consentement. Le carnet et les paramètres de recherche sont exclus des événements explicites ; les réglages distants restent à vérifier.
4. Utiliser le panel `content/seo-geo-prompts.csv` comme liste de questions à observer, dans des sessions neuves avec recherche, sur des surfaces réellement accessibles. Consigner date, moteur, région, réponse exacte et liens. Une ligne vide n’est ni une absence de citation ni un résultat nul. Répéter le même panel pour comparer ; séparer mentions de marque, citations et visites.
5. Prioriser l’enrichissement des synthèses à partir des requêtes et lacunes observées. Faire relire les sujets par une personne compétente avant de revendiquer une validation scientifique indépendante. Ne pas indexer des dossiers vides pour augmenter le nombre de pages.

Les coordonnées publiques d’édition doivent encore être renseignées dans `content/legal.json`. Ne pas les déduire des coordonnées privées partagées dans la conversation.

## Références de méthode

- [Google : fonctionnalités IA et sites web](https://developers.google.com/search/docs/appearance/ai-features). Les pratiques SEO habituelles restent pertinentes ; ni fichier IA spécial ni schéma GEO spécial ne sont requis. L’affichage et les citations ne sont pas garantis.
- [Google : fonctionnement des données structurées](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data). Le balisage décrit le contenu visible ; validité du JSON ne prouve ni résultat enrichi ni visibilité.

Ces références ont été consultées le 30 septembre 2026. Aucune permission d’entraînement ou modification de comptes externes ne découle de ce document.

## Lot éditorial du 30 septembre 2026

Encadrés réponse/réserve/références sur les dossiers 10, 29, 33 et 41, disponibles dans le HTML et après navigation. Descriptions spécifiques et lectures liées par les connexions éditoriales existantes. Dossier 29 désormais rédigé ; quatre définitions ajoutées et panel GEO complété. Cette mise en forme facilite la lecture et l’extraction de passages, sans garantir une citation IA ou un classement. Search Console redirige vers la page de connexion dans le navigateur accessible : les mesures restent à collecter, pas à extrapoler.

## 2026-09-30 — URL descriptives et métadonnées par intention

Registre éditorial dans `content/seo.json` : 42 slugs stables de dossiers, 73 pages HTTP publiques avec titres et descriptions spécifiques, plus le carnet privé. Exemple : `/dossiers/matiere-noire-energie-noire/`. Les identifiants numériques restent les clés des notes et des expériences. Ne pas modifier un slug publié simplement pour changer un titre.

Le routeur, le HTML statique, les liens internes, le partage, les balises sociales, les canoniques, les fils d’Ariane et le sitemap utilisent le registre commun. Les 42 anciennes adresses numériques et leurs variantes sans barre finale ou index.html ont 126 règles permanentes Vercel (308), complétées par 145 règles pour les variantes des pages canoniques. La normalisation automatique trailingSlash est omise afin d’éviter les chaînes. Des aliases avec lien et reprise JavaScript sont fournis pour les aperçus statiques ; `_redirects` fournit les règles 301 pour les hébergeurs compatibles.

`npm run sync:seo` synchronise les règles et les huit en-têtes HTML source. Le build exige toutes les intentions, des champs non vides, uniques, et une description adaptée lorsque le dossier devient rédigé. Les budgets de longueur sont des choix éditoriaux, pas des limites techniques imposées par Google. `check:public` compare les métadonnées des 73 pages au registre et rejette les liens internes numériques. AGENTS.md conserve l’exigence SEO/GEO à chaque lot.

Validation locale : 69 tests, TypeScript et contrôle public réussis (239 fichiers, 4630 références). Navigateur : fiche vide 28 → dossier 29, retour/rechargement, ancienne adresse 33 avec mode et ancre conservés ; descriptions, robots et canoniques corrects. Publication et redirections HTTP distantes à confirmer après push. Axeptio reste suspendu ; indexation GSC et citations IA non mesurées.

Références : [migration d’URL Google](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [titres](https://developers.google.com/search/docs/appearance/title-link), [descriptions](https://developers.google.com/search/docs/appearance/snippet), [redirections Vercel](https://vercel.com/docs/routing/redirects).
