# Composants React — intégration

Le site existant est un atlas statique en JavaScript. Le laboratoire `/trou-noir/` est une île React autonome, compilée avant publication. La page des parcours charge également une île React à la demande ; les autres pages de l’atlas ne chargent pas React.

## Structure

- `components/ui/black-hole.tsx` : composant fourni, complété avec paramètres et repli accessible. Export nommé `Example`, export par défaut compatible avec l’extrait d’origine.
- `components/ui/black-hole-utils/renderer.ts` : moteur manquant dans la demande, créé pour cette intégration ; API `ready`, `setOptions`, `dispose`.
- `components/ui/black-hole-utils/shaders.ts` : rendu WebGL original, illustratif.
- `components/ui/black-hole-utils/model.ts` : normalisation des réglages et calcul indépendant du rayon.
- `components/ui/demo.tsx` : démo plein écran fournie ; disponible comme source réutilisable, non montée à la place du site.
- `trou-noir/app.tsx` : contrôles et calculateur, état React local.
- `styles/globals.css` : point d’entrée Tailwind v4, sans Preflight pour préserver le CSS existant.
- `trou-noir/style.css` : composition du laboratoire ; `atlas/brand.css` reste l’identité partagée.
- `components.json`, `tsconfig.json`, `lib/utils.ts` : conventions shadcn/ui, TypeScript strict et alias `@/`.

`components/ui` n’est pas obligatoire pour React lui-même. Ce chemin est retenu pour correspondre aux imports fournis et donner une destination stable aux composants réutilisables et à la configuration shadcn. Aucun provider n’est nécessaire. Les icônes sont issues de Lucide React. L’image de repli est un SVG original : aucune photographie de stock ne participe au rendu et aucun appel à Unsplash n’est nécessaire.

## Installation et développement

La configuration est déjà en place ; sur un nouveau clone :

```sh
npm ci
npm run typecheck
npm run build
npm run dev
```

`dev` reconstruit le composant après modification des TS/TSX et styles sources. Rafraîchir ensuite la page. `scene.js` et `utilities.css` sont générés et ignorés par Git ; `build:public` les reconstruit automatiquement. Versions exactes verrouillées par `package-lock.json`.

Pour reproduire la base manuellement dans un autre projet :

```sh
npm install react react-dom lucide-react clsx tailwind-merge
npm install -D typescript @types/react @types/react-dom esbuild tailwindcss @tailwindcss/cli
```

Pour un nouveau projet utilisant le parcours standard shadcn, utiliser `npx shadcn@latest init` puis les instructions du framework choisi. Ce dépôt dispose déjà d’une configuration manuelle : ne pas réinitialiser son architecture statique. Les chemins de composants/styles et l’alias sont configurés dans `components.json` et `tsconfig.json` ; tout ajout via la CLI doit être contrôlé avec `typecheck` et le build.

Documentation de référence : [installation manuelle shadcn/ui](https://ui.shadcn.com/docs/installation/manual), [CLI Tailwind](https://tailwindcss.com/docs/installation/tailwind-cli).

## Utilisation

```tsx
import BlackHole from '@/components/ui/black-hole';

<div style={{ height: 560 }}>
  <BlackHole settings={{ inclination: 12, zoom: 1, palette: 'amber', playing: false }} />
</div>
```

Paramètres : hauteur de vue 3–85 degrés au-dessus du disque, zoom 0,7–1,7, exposition 0,4–2, palette `amber` ou `ice`, visibilité du disque et lecture/pause. Sans props, la vue est statique. Le parent doit fournir une hauteur. L’état reste dans la page, sans service distant ni sauvegarde automatique.

## Performance, accessibilité et portée

Résolution interne limitée à 900 × 600 maximum ; animation visée à 24 images/s, sans garantie sur tous les appareils. Pause initiale, arrêt lorsque la page est cachée ou que la scène sort de l’écran ; réaction à la préférence de réduction des mouvements. Les ressources GPU, événements et observateurs sont libérés au démontage. Perte de contexte ou WebGL indisponible : illustration fixe et message visible.

Les réglages possèdent des libellés, sont utilisables au clavier et ne nécessitent pas un geste dans le canvas. Le contenu explicatif reste dans le HTML statique. Le repli WebGL ne bloque pas le calculateur. Le plein écran dépend du navigateur.

La scène est une illustration à pas finis avec émission artistique, sans validation scientifique du rendu. Seul le calcul `rₛ = 2GM/c²` est présenté comme une relation physique quantitative pour un trou noir non chargé et sans rotation. Les deux sources NASA sont affichées dans le laboratoire et consignées dans le registre.

## Gateway Flow — entrée des parcours

`components/ui/gateway-flow.tsx` adapte le canvas fourni : courbes de Bézier pointillées, particules convergentes et impulsion au clic. Il est monté par `components/gateway-entry.tsx` uniquement sur `/#/parcours`, derrière le choix d’itinéraire. La carte et les liens restent dans le HTML de l’atlas. Le bouton de l’accueil « Par où commencer ? » ouvre cette page.

L’iframe et le formulaire de connexion de la démo fournie ne participent pas à cet usage. Le rendu est direct, sans scripts CDN, police distante supplémentaire ni modification de l’horloge globale. Aucune dépendance supplémentaire n’est nécessaire. Démo réutilisable : `components/ui/gateway-flow-demo.tsx` ; styles d’intégration : `atlas/brand.css`.

Props disponibles : `mode` (dark/light/auto), `speed`, `size`, `gap`, `length`, `density`, `strokeWidth`, `opacity`, `hue`, `saturation`, `brightness`, `className`, `style`. Le parent doit fournir une hauteur. L’intégration utilise le mode sombre et une vitesse de 0,5. `speed=0` suspend l’animation en conservant sa phase. Les valeurs numériques sont bornées.

Le canvas décoratif est masqué aux technologies d’assistance ; bouton pause accessible, préférence de mouvement réduit respectée, arrêt hors écran ou dans un onglet caché. Résolution limitée à 1,5 fois la taille CSS, cadence visée de 30 images/s. Observateurs, événements et animation sont libérés à chaque changement de route. Le bundle `atlas/gateway-flow.js` est généré et ignoré par Git ; les commandes build/dev/public existantes le reconstruisent.

## Footer éditorial partagé

`components/ui/footer-section.tsx` adapte le footer fourni à The42laws : invitation à explorer, trois colonnes de liens existants, logo 42, grande signature typographique et retour en haut. `Footer` accepte `continuation` (title/href) et `note` pour préserver les particularités des laboratoires. Démo source : `components/ui/footer-demo.tsx`.

`components/footer-static.tsx` rend le composant avec React DOM Server. `scripts/build-footer.mjs`, appelé par le pipeline React existant, remplace le footer des huit entrées HTML ; les 42 dossiers publics et leur index héritent du shell. Ces blocs HTML sont générés : modifier le TSX puis exécuter `npm run build`. Le rendu est versionné et reste utilisable sans JavaScript. La page 404 conserve sa composition compacte.

Les styles sont dans `atlas/brand.css`, avec sélecteurs préfixés pour résister aux anciens styles des laboratoires. L’apparition utilise CSS et IntersectionObserver dans `atlas/footer.js`, en remplacement de Motion ; aucune nouvelle dépendance ni bundle React côté visiteur pour ce footer. La réduction des mouvements est respectée. Le retour en haut conserve la route de l’atlas et replace le focus au début du document. Aucune image de stock ni lien social fictif ; les icônes Lucide existantes sont rendues en SVG dans le HTML.
