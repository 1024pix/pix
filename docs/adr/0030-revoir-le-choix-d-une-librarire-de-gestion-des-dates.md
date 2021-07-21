# 30. Revoir le choix de l'utilisation de la librairie Moment.js

Date : 2021-07-21

## État

Adopté

## Contexte

L'API de date ECMAScript n'est pas pratique, d'où l'utilisation de [Moment](https://github.com/moment/moment) qui était
la solution la plus répandue en 2016.

### Les difficultés rencontrées aujourd'hui

La librairie n'est plus maintenue. L'immutabilité diminue le nombre de bugs, or les objets Moment sont mutables. La
taille du bundle de l'application sera plus grande qu'avec une autre librairie. La tactique du tree shaking permet de
réduire cette taille en enlevant les fonctionnalités non utilisées (par exemple l'internationalisation). Mais celle-ci
n'est pas disponible pour Moment.

De plus, Moment ne gère pas correctement l'arabe et le coréen et l'internationalisation est très verbeuse.

D'autre part, ChartJs est utilisé pour Pix Orga pour tout ce qui a trait à la Data Visualisation (notamment pour les
graphiques de type time). Moment pose des problèmes d'intégration avec ChartJs.

[Voir les détails](https://momentjs.com/docs/#/-project-status/)

### Solution n°1 : Garder Moment.js

Défaut :

- Poids élevé dans le bundle final (80kb).

Avantages :

- Librairie très utilisée qui présente désormais moins de bugs.
- Librairie populaire, gage de facilité d'intégration pour de nouveaux arrivants.
- Déjà utilisée chez Pix, pas de migration nécessaire.

### Solution n°2 : Migrer vers Day.js

Défaut :

- Nécessité de migrer vers cette solution.

Avantages :

- Poids réduit dans le bundle final (6kb).
- Day.js utilise la même API que Moment, facilitant ainsi l'appropriation par les équipes.

### Solution n°3 : Migrer vers date-fns

Avantage :

- Interface fonctionnelle `FP`, familière aux développeurs Pix.

Défauts :

- Nécessité de migrer vers cette solution.
- Même avec le `tree-shaking`, le bundle final est plus volumineux que `Day.js` (13kb).
- [Format](https://date-fns.org/v1.9.0/docs/format) de date différent des autres librairies.

### Solution n°4 : Migrer vers Luxon

Défauts :

- Nécessité de migrer vers cette solution.
- Pas de `tree-shaking`, le bundle final est plus volumineux que `Day.js` (20kb).

Avantages :

- Cette librairie est maintenue.

### Solution n°5 : Utiliser les fonctions natives

#### `Intl`

La fonctionnalité ECMAScript est décrite [ici](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).
Elle est disponible partout, même sur IE11. Elle permet de gérer les dates, y compris les dates internationalisées.

Avantages :

- Gage de facilité d'intégration pour de nouveaux arrivants.

Défauts :

- Nécessité de migrer vers cette solution.
- Assez verbeux.

#### `Temporal`

La fonctionnalité ECMAScript est décrite [ici](https://tc39.es/proposal-temporal/docs/). Elle permet de gérer les dates,
y compris les dates internationalisées.

Avantages :

- Gage de facilité d'intégration pour de nouveaux arrivants.

Défauts :

- Nécessité de migrer vers cette solution.
- Toujours en catégorie expérimentale (Stage 3 TC39), donc non stable.

## Décisions

Nous choisissons la solution Day.js parce que :

- Le gain de poids est le plus important.
- Son utilisation est similaire à celle de Moment pour les fonctionnalités de base.

## Conséquences

Pour gagner immédiatement de la taille sur le bundle, remplacer intégralement Moment.

Suivre par
exemple [ce guide de migration](https://levelup.gitconnected.com/changing-from-moment-to-day-js-how-why-and-fixing-vue-chartjs-786314ef4697)
.

