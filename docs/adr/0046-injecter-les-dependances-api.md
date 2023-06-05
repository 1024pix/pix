# 46. Injecter les dépendances dans l'API

Date : 2023-05-05

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin d'injecter des dépendances pour deux raisons :

- isoler les règles métier (architecture applicative);
- tester automatiquement le code.

### Architecture applicative

L'architecture de l'API est inspirée par la Clean architecture.
Dans ce modèle, les règles de métier sont isolées dans le domaine (use-case et entité).

Les règles métier ne dépendent pas de l'implémentation :

- de la couche de persistance et des clients distants (couche infrastructure);
- de la couche applicative en entrée.

Pour cela, les composants de la couche infrastructure doivent être injectés dans les use-case (couche domaine).
Cela peut se faire manuellement en passant les dépendances en paramètre du use-case.
Mais, comme un use-case peut avoir de nombreuses dépendances, la tâche peut être fastidieuse.
Il est intéressant de déléguer cette tâche à de l'outillage.

### Stratégie de test

Nous souhaitons effectuer des tests automatisés sur différents niveaux :

- le comportement du composant, pris isolément : test unitaire ;
- l'interaction du composant avec ses dépendances : test intégré.

Pour tester le composant de manière isolée, il nous faut substituer les dépendances par des doublures de test.
Si les dépendances du composant sont injectées, la substitution par des doublures de test est possible.

Si les dépendances du composant ne sont pas injectées, en utilisant le système de module CommonJs, il était possible de
les isoler. Mais depuis le passage au système de module ESM, ce n'est plus possible, car les exports sont immuables.
Il faut donc injecter les dépendances dans ces composants.

### Solution n°1 : Framework

**Description**

Il existe plusieurs frameworks d'injection, eux-mêmes utilisés par des frameworks Node, par exemple :

- [Inversify](https://github.com/inversify/InversifyJS)
- [InjectionJS](https://github.com/mgechev/injection-js)

La configuration se fait par annotation.

```js
@injectable() function someServiceToBeInjected() {
  (
..)
}
```

**Avantage(s):**

- fiabilité: la correction de bug est assurée par la communauté
- évolution : l'introduction de fonctionnalités est assurée par la communauté

**Inconvénient(s):**

- compétences spécifiques au framework à acquérir
- modification massive de la codebase

### Solution n°2 : Solution custom

**Description**

Solution native JS

**Avantage(s):**

- pas de couplage au framework
- compréhensible sans connaissance d'un framework
- solution existante
- possibilité d'adapter finement l'injection de dépendances à nos besoins

**Inconvénient(s):**

- la connaissance peut se perdre, car le code d'injection n'est que rarement modifié
- perte d'énergie à implémenter une solution qui est déjà disponible ailleurs

## Décision

Nous avons choisi la solution n°2, à savoir l'injection custom, car l'utilisation d'un framework nécessite la
modification massive de la codebase.

## Conséquences

La solution custom prend différentes formes suivant l'état actuel de la codebase.

Suivant la couche, l'injection est :

- automatique, en suivant la signature des paramètres ;
- manuelle.

Il existe deux cas où les dépendances ne sont pas injectées :

- les use-case (couche domaine) ne sont pas injectés dans les controllers (couche applicative);
- les controller (couche applicative) ne sont pas injectés dans les routeurs (couche applicative), car le framework
  HapiJs ne le permet pas.

Un guide d'implémentation est [disponible ici](../api-dependencies.md).
