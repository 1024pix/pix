# 47. Modulariser le code NodeJS

Date : 2023-05-05

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin de :

- répartir le code dans des unités, appelées modules;
- faire collaborer ces modules;
- tester indépendamment et en collaboration ces modules;
- dans un environnement NodeJS.

Cette décision relève de l'architecture applicative, mais se situe à un niveau plus bas que des patterns tels que
l'architecture en couche, ou l'architecture hexagonale. Elle s'applique aussi bien à l'API qu'aux front-ends.

Nous examinons uniquement les deux solutions les plus maintenues: CommonJS et ECMA script.
Il existe d'autres solutions : AMD, CJS, CJS2, UMD.

### Solution n°1 : Modules CommonJS

**Description**

Les modules CommonJs ont longtemps constitué [la seule solution native](https://nodejs.org/api/modules.html) depuis la
release originelle de NodeJS, en 2009.
> CommonJS modules are the original way to package JavaScript code for Node.js

**Avantage(s):**

- syntaxe connue des développeurs
- syntaxe permissive, permettant de nombreux cas d'usages

**Inconvénient(s):**

- cette solution n'étant plus la solution officielle, sa maintenance sera réduite
- le caractère permissif de la syntaxe peut mener à de la complexité inutile
  - export
    - de nombreuses opérations sont possibles lors de l'export :
      - instanciation de singleton
      - déstructuration et renommage d'import précédents

Export CJS

```js

module.exports = {
  EMPTY_BLANK_AND_NULL,
  domainBuilder: require('./tooling/domain-builder/factory'),
  testErr: new Error('Fake Error'),
```

Export ESM

```js
export {
  EMPTY_BLANK_AND_NULL,
  domainBuilder,
  testErr,
```

- import
  - les imports ne sont pas limités en début de fichier, mais n'importe où dans le code, même dans une boucle
    - de nombreuses opérations sont possibles lors de l'export :
      - déstructuration
      - instanciation

Import CJS

```js
```

Import ESM

```js
```

### Solution n°2 : ECMA script modules

**Description**

Les modules ECMA script sont disponibles nativement et leur interface est stable depuis (
2021)[https://nodejs.org/docs/latest-v14.x/api/esm.html#introduction]
> ECMAScript modules are the official standard format to package JavaScript code for reuse.

**Avantage(s):**

- solution utilisée nativement dans les navigateurs
- solution officielle de NodeJS, pour laquelle la majorité des efforts de développement est développée
  - dans le coeur NodeJS
  - dans les librairies de l'écosystème, par exemple les règles `eslint`
- syntaxe plus stricte
  - limitée aux opérations d'export et d'import
  - les modules exposés sont immutables, en lecture seule, ce qui impose l'injection de dépendance pour tester un
    composant sans ses dépendances
- permet une meilleure complétion lors de l'import dans les IDE
- éviter les erreurs en activant (le mode strict par
  défaut)[https://262.ecma-international.org/6.0/#sec-strict-mode-code]

**Inconvénient(s):**

- syntaxe moins connue des développeurs
- coût de migration, car elle n'est pas utilisée dans l'API
  - migration des imports et exports
  - injection de dépendances pour les modules qui sont testés en isolation de leurs dépendances

## Décision

Nous avons choisi la solution n°2, à savoir les modules ECMA script, car le support officiel et le caractère strict sont
des avantages déterminants, malgré les coûts de migration.

## Conséquences

Migrer le code de l'API des modules CommonJS vers les modules ECMA script.

Pour cela :

- utiliser une solution de modification de code (codemod), à savoir la librairie
  éprouvée (`jscodeshift`)[https://github.com/facebook/jscodeshift];
- effectuer des corrections manuelles lorsque la migration automatisée n'est pas judicieuse (volumétrie/complexité).

Encadrer l'usage des modules ECMA script avec des règles de lint:

- les imports doivent référencer un fichier existant
- les imports seront majoritairement nommés
