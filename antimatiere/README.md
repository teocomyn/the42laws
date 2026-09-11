# Antimatière — laboratoire interactif

Deuxième exploration de The42laws, créée à partir du texte transmis par Teo. HTML, CSS, JavaScript et Canvas 2D ; aucun framework, aucune compilation ni ressource distante nécessaire à l’affichage.

## Ouvrir

Ouvrir `index.html` dans un navigateur, ou lancer depuis la racine du projet :

```sh
python3 -m http.server 4242 --bind 127.0.0.1
```

Puis visiter http://127.0.0.1:4242/antimatiere/.

## Trois expériences

1. Comparateur électron/positon, proton/antiproton et neutron/antineutron.
2. Animation d’annihilation e⁻ + e⁺ → 2γ avec énergie cinétique réglable, bilan énergétique et longueur d’onde des photons, lancement, pause, reprise et réinitialisation.
3. Comptage de 24 paires et d’un excès signé de −5 à +5. L’utilisateur retire les paires et observe le reliquat, puis peut reconstruire l’état initial.

Le portrait est une évocation artistique. L’animation s’arrête hors écran et lorsque l’onglet est masqué. Le réglage de réduction des mouvements suspend le portrait et affiche directement le résultat lors du lancement d’une annihilation.

## Modèle physique

Dans le centre de masse, les deux particules ont la même énergie cinétique K. Le canal sélectionné produit deux photons d’énergies égales, en directions opposées :

- E_total = 2(m_e c² + K).
- E_photon = m_e c² + K.
- λ = hc / E_photon.

Constante CODATA 2022 : m_e c² = 0,51099895069 MeV. Constantes SI exactes h, c et e. L’entrée est bornée à 0–2 MeV par particule. Les valeurs calculées sont arrondies dans l’interface. Les tailles, temps, trajectoires entrantes et couleurs ne sont pas physiques ; le cas K = 0 est la limite au repos. Le modèle ne prédit ni fréquence d’événements, ni distribution angulaire, ni branchements vers d’autres canaux.

Le modèle de comptage conserve l’excès initial et retire une particule et une antiparticule par paire. Il ne génère aucune asymétrie et n’est pas une simulation cosmologique.

## Vérifier

Depuis la racine :

```sh
node --test tests/antimatter.test.cjs
node --check antimatiere/app.js
```

Les tests comparent notamment le résultat au repos à la raie à 511 keV et à la longueur d’onde de Compton publiée par CODATA, puis vérifient le bilan énergétique et le comptage pour les onze valeurs du curseur d’asymétrie.

Voir [les notes scientifiques](NOTES_SCIENTIFIQUES.md) pour les choix de vulgarisation et les corrections apportées au texte de départ.
