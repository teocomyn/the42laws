# The42laws — Identité visuelle

## Direction

Cobalt, papier ivoire et verre optique. Une identité éditoriale pour un atlas de recherche : la matière est représentée par des couches translucides, les liens par des points, les questions par des numéros. Le logo 42 irisé reste le signe de reconnaissance commun.

Les références fournies par Teo servent à définir les matières, le contraste et le rythme. Les marques, portraits et vidéos de référence ne sont pas intégrés dans le site. Les illustrations SVG sont des compositions originales ; elles sont décoratives et ne représentent pas des résultats scientifiques.

## Palette et typographie

| Usage | Valeur |
| --- | --- |
| Cobalt de marque | `#1e3d9a` |
| Papier de couverture | `#f3f2ed` |
| Encre sur papier | `#1a202c` |
| Fond sombre | `#101115` |
| Panneaux | `#181b23` |
| Texte principal | `#f3f2ed` |
| Texte secondaire | `#adb5c4` |
| Accent clair | `#bfd2ff` |

Les couleurs propres aux sept domaines sont conservées comme repères sémantiques. Georgia pour les titres éditoriaux, polices système pour les contrôles et la lecture, monospace pour les légendes. Aucune police distante supplémentaire.

## Fichiers

- `atlas/brand.css` : couche commune chargée après les styles de l’atlas et des six laboratoires.
- `atlas/brand-orb.svg` : sept couches, en référence aux sept domaines.
- `atlas/brand-field.svg` : texture de points, utilisée seulement sur les surfaces décoratives.
- `atlas/brand-lab-*.svg` : six illustrations de couverture.
- `atlas/brand-share.svg` : source de la carte sociale, exportée en `brand-share.png` (1200 × 630). Le build public utilise ce PNG pour Open Graph et Twitter.
- `atlas/favicon-42-*.png` et `favicon.ico` : identité 42 déjà installée, réutilisée sans modification.

## Intégration

Accueil restructuré : couverture, chiffres, laboratoires, carte des domaines, synthèses, parcours et carnet. Les liens, la recherche, les routes des dossiers et le carnet `the42laws:v1` restent fonctionnels. Les pages de lecture privilégient le contraste et l’espace ; aucun motif derrière le texte scientifique ou les graphiques de données.

Les micro-interactions de marque se limitent au survol. Elles sont neutralisées avec `prefers-reduced-motion`. Les illustrations ont des dimensions explicites ; les couvertures sous la ligne de flottaison sont chargées à la demande. Aucun lecteur vidéo, WebGL ou nouvelle dépendance de production.

## Validation de cette livraison

Vérification visuelle aux formats 320, 390, 768 et 1440 pixels. Les six laboratoires ont été ouverts à 320 pixels sans débordement horizontal. Lecture complète d’un dossier, recherche « conscience », menu mobile et fermeture Échap vérifiés. Les tests scientifiques et fonctionnels existants restent la référence pour les calculs ; cette livraison ne modifie pas les modèles.
