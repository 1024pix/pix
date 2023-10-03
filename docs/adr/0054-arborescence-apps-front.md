# 54. Arborescence Apps Front

Date : 2023-09-26

## État

En cours

## Contexte

### Constats

- Lors de l'Onboarding, il faut du temps pour appréhender l’arborescence des projets EmberJS car différente de celles des autres framework JavaScript connues en 2023.
- La taille des Apps Front Pix ne fait que croître cependant, plus notre codebase grandit plus la question de l'arborescence est importante car il est de plus en plus complexe de retrouver les fichiers liés à une fonctionnalité.
- Il est très difficile de retrouver naturellement les tests et le style d'un template rapidement

### Objectifs

- Repenser la structure des apps front Pix afin de faciliter le travail des équipes et leur navigation à travers une arborescence fonctionnelle (par page) plutôt que technique (typologie de fichiers).
- Éclaircir et documenter l’arborescence (Pix Orga pour commencer)
- Avoir une structure claire et lisible pour les équipes
- Clarifier les intentions dès les premiers répertoires (et pouvoir approfondir pour détailler par couche)
- Limiter le nombre de fichiers par répertoire

### Contraintes

- Refactorings uniquement structurels
- Changements iso-fonctionnels
- Pas de régression (CI passe, tests passent, iso-perfs, pas de bug)
- Ne pas dégrader l’expérience de développement
- Avoir une arborescence qui puisse être appliquée sur tous les fronts Ember

## Solution 1 : Arborescence classique d'Ember

L'arborescence classique est l'arborescence par défaut lors de la création d'une nouvelle application ou d'un module complémentaire Ember. Elle organise le système de fichiers par types d'entités.

Pour plus d'information, la documentation se trouve [ici](https://cli.emberjs.com/release/advanced-use/project-layouts/#classiclayout)

#### Exemple

```
1 | app
2 | ├── components
3 | |   ├── tags.js
4 | |   └── tags.hbs
5 | ├── controllers
6 | |   └── post.js
7 | ├── models
8 | |   └── post.js
9 | ├── routes
10| |   └── post.js
11| ├── templates
12| |   └── post.hbs
13| ├── app.js
14| ├── index.html
15| └── router.js
```

### Avantages

- Garder l'arborescence "classic"
- Directement ISO avec les autres fronts de Pix
- La documentation est facilement accessible car cette arborescence est l'arborescence de base et celle préconisée pour un projet Ember.

### Inconvénients

- Complexité à retrouver le template lié au controller
- Complexité à retrouver les tests liés au composant
- Complexité à retrouver le style lié au composant

## Solution 2 : Arborescence pods d'Ember

Pour plus d'informations sur l'arborescence pods, d'Ember, vous pouvez retrouver sa documentation [ici](https://cli.emberjs.com/release/advanced-use/project-layouts/#podslayout)

#### Exemple

```
1 | app
2 | ├── components
3 | |   └── tags
4 | |       ├── component.js
5 | |       └── template.hbs
6 | ├── post
7 | |   ├── controller.js
8 | |   ├── model.js
9 | |   ├── route.js
10| |   └── template.hbs
11| ├── app.js
12| ├── index.html
13| ├── resolver.js
14| └── router.js
```

### Avantages

- Les fichiers techniques sont regroupés fonctionnellement
- Cohérence entre API et Fronts
- Arborescence déjà mise en place chez Pix 1D
- Plus proche d'autres frameworks JS
- Il y beaucoup de libertés sur la manière de construire son arborescence : structure par routes (ex : `app/pods/assessments/resume/route.js`), par entité métier (ex : `app/pods/assessment/model.js`), les tests au plus proche (`app/pods/**/*.integration_test.js`) ou en dehors de `app` (`tests/integration/**/*.test.js`), etc...

### Inconvénients :

- L'arborescence pods est bien supportée mais pas mise en avant par Ember ce qui rend sa documentation plutôt difficile à trouver. (cf. [emberjs/rfcs#650](https://github.com/emberjs/rfcs/issues/650) et [emberjs/rfcs#651](https://github.com/emberjs/rfcs/issues/651))
- Cela implique une duplication temporaire des helpers de test. (jusqu'à la fin de la migration)
- Tous les fichiers auront des noms similaires. Lors d'une recherche il faudra se reposer sur le nommage des répertoires et non sur plus sur celui des fichiers.
- Les plugins d'IDE pour accéder aux tests associés aux fichiers ne fonctionneront plus avec le nouveau nommage (exemple : `Cmd+Maj+T` sur VSCode pour accéder aux tests liés)
- [La documentation](https://cli.emberjs.com/release/advanced-use/project-layouts/) est légère

## Décision

La solution 2 semble la plus adéquate. Nous proposons une **phase d'expérimentation pour discuter** de la structure à suivre plus tard suite à la liberté de construction d'arborescence que nous offre cette solution.

## Remarque

Les deux structures sont compatibles ce qui permet de faire une transition en douceur au fur et à mesure des développements.

## Conséquences

Création d'un dossier pods enfant du répertoire app avec la nouvelle arborescence. La PR avec cette structure se trouve [ici](https://github.com/1024pix/pix/pull/6961).
Les différentes équipes devront migrer pas à pas les fichiers vers la nouvelle arborescence.
