# Typescript

# Craintes / réticences / peurs
Mauvais accompagnement de la montée en compétence : 
- mauvais guidage / cadrage des nouveaux 
- ajout de complexité en apprentissage
- montée en compétence apporte une phase initiale douloureuse
- premiers types complexes qui vont être difficile à écrire
- devoir apprendre quelque chose qui pour moi est plus de l'ordre du facultatif

Dégradation de la Développer eXpérience : 
- ajout de complexité en tooling
- que la toolchain TS dégrade ma DX
- temps de build supplémentaire
- un temps en plus pour compiler

Mauvaise utilisation de Typescript : 
- qu'on prenne TS comme prétexte pour faire de la POO
- utiliser Typescript pour autre chose que du typage
- ne pas pouvoir profiter pleinement des capacités du langage
- amener des anti-patterns dans le code
- avoir une grande disparité car il n'y a pas de base commune
- que cela apporte une nouvelle douleur concernant un mauvais typage de l'api

La migration devient un chantier sans fin : 
- que la migration soit aussi longue que Bookshelf
- que la transition prenne beaucoup de temps
- que cela nécessite de gros refacto
- refactos à moitié finis (cela sera-t-il pareil pour Typescript ?)
- devenir un enième chantier pas finit car on est sur une code base de +4ans très hétérogène

Doutes sur la pertinance du projet : 
- que techniquement ça ne soit pas possible de mettre Typescript sur un vieux projet, que ça ne soit viable que pour des projets récents / qui démarrent
- n'avoir aucun apport / avantages du langage typé (peu d'études qui montrent les bénéfices évidents)
- que la mise en place de Typescript ne ne soit qu'une question de goût
- autant je vois Typescript coté API, autant l'apport coté Front me parait minime, voir contre productif.


# Mise en place de Typescript

Le but de cette page est de détailler les différentes étapes pour parvenir à la mise en place de **Typescript** sur l’api. Il n’est pas question ici d’argumenter les pour et les contres de la mise en place de **Typescript**. Plein d’articles traitent déjà de ce sujet.

# 1 Prérequis

Une PR qui remplira tous les prérequis de cette section sera créée. Une fois mergée, l’api supportera **Typescript**, et tous les futurs développements devront suivre la stratégie de typage.

## 1.1 Rétrocompatibilité

La mise en place de **Typescript** ne doit pas introduire de régression par rapport au code existant, et il ne doit pas casser les CI/CD. Le but est ici de lister les différents critères de rétrocompatibilité souhaités, et de détailler les étapes qui permettront de les satisfaire.

packages utilisés

- ts-node [GitHub - TypeStrong/ts-node: TypeScript execution and REPL for node.js](https://github.com/TypeStrong/ts-node)
- ts-node-dev [GitHub - wclr/ts-node-dev: Compiles your TS app and restarts when files are modified.](https://github.com/wclr/ts-node-dev)
- ts-migrate https://github.com/airbnb/ts-migrate
- npm i -D @swc/core @swc/helpers

### Rétrocompatibilité du build

Utilisation de ts-node

Testé : ✅

### Rétrocompatibilité des tests (unitaires, intégration, acceptance)

Utilisation de ts-node/register avec mocha pour lui permettre de run des tests écrits dans des fichiers `.ts`, tout en conservant l’exécution des tests écrits en `.js`.

Testé : ✅

### Rétrocompatibilité du watch mode lors de l’exécution de l’api en dev

Utilisation de ts-node-dev qui embarque un nodemon et ça fait le ☕

Testé : ✅

### Rétrocompatibilité du watch mode lors du run des tests

Idem que pour les tests : utilisation de ts-node/register

Testé : ✅

### Rétrocompatibilité du lint

On souhaite conserver les règles de lint pour les fichiers `.js`, et mettre en place le lint des fichiers `.ts`. Pour faire cela, on met en place des règles spécifiques de lint des fichiers `.ts` en overridant les règle de base du linter. Ainsi, le linter pour les fichiers `.ts` ne vient pas nous embêter sur les fichiers `.js`. Il faut définir ensemble des règles de lint des fichiers ts

Testé : ✅

### Rétrocompatibilité de knex (scripts de seeds)

Afin de permettre de seeder la BDD en local, il faut que tous les fichiers soient renommés en `.ts`. Ainsi knex sait qu’il doit faire appel à ts-node/register pour executer les migrations en transpilant d’abord les dépendances du `.ts` ⇒ `.js` 

Ainsi, le script npm `npm run db:reset` reste opérationnel.

Testé : ✅

## 1.2 Installer les @types des packages npm

Afin de tirer le meilleur parti de typescript, on souhaite avoir accès aux types typescript des packages npm de l’api.

Status : 🕞

# Stratégie de typage

Le sujet est assez vaste. Il faut qu’on se donne un point où concentrer nos efforts. Là où il y aurait la plus forte valeur ajoutée me semble être la couche repository. Ça serait pratique de connaitre quels sont les types remontés par les méthodes de repository. Par exemple, si on a un champ en BDD qui est un integer, on veut avoir cette information dans l’api pour savoir quel type de donnée on manipule. Si on déroule la pelotte, on s’aperçoit assez vite que Les méthodes du repo instancient des objets du domaine. Il faudrait donc par typer les modèles qui sont dans `lib/domain/models`.

Les classes `lib/domain/models` sont typées iso par rapport à la base Postgres.

Pour cela, l’idéal serait de se baser sur les types de la base `Postgres`. Pour cela, on va extraire les types de chaque table de Postgres (utiliser un package npm ou créer un script). On va ensuite créer des interfaces à partir de ces types et faire en sorte que les classes du modèle implémentent ces interfaces. Ainsi, on aura initié les types de base de notre application. Ils seront le ciment des types de retour des méthodes de `lib/infra/repository`.

Status : 🕞

# Methodologie de migration

Afin de migrer des fichiers vers typescript, tous les prérequis de la section prérequis devront être satisfaits (Status ✅).

## Les étapes

1. Tous les prérequis sont satisfaits
2. On a créé les types pour tous les modèles du domaine en se basant sur les types de la base `Postgres`

# Points d’attention

Utilisation avec config de test webstorm/intelliji :

- Ajouter la variable d’env `TS_NODE_TRANSPILE_ONLY=true`
- Ajouter l’extra mocha option : `r ts-node/register`

## La performance

**A mettre en place, testé avec vincent et c’est une tuerie.**

Dans l'état, la mise en place de typescript n’a pas beaucoup allongé le temps de run des tests. On peut quand même améliorer encore les perfs => Etudier l’utilisation de swc avec ts-node. [SWC | ts-node](https://typestrong.org/ts-node/docs/swc)

## Typechecking

Le typechecking est couteux en ressources et peut rendre l’exécution des tests très longs. C’est pourquoi on le désactive avec l’option --transpileOnly du compilateur typescript pour les tests (variable d’environnement `TS_NODE_TRANSPILE_ONLY=true`). Grâce au transpiler SWC, on pourra peut être réactiver le typecheck pendant les tests. A voir.


## Général

### Utilisation de typescript

