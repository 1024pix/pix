# API

## Conventions de nommage

Les classes prennent une majuscule au début.
Les modules et variables prennent une minuscule au début.
Sauf exception, privilégier l'ordre alphabétique pour trier une suite de déclarations, require, ...

```javascript
// BAD
const sessionRepository = require(...);
const assessmentRepository = require(...);
const certificationRepository = require(...);

// GOOD
const assessmentRepository = require(...);
const certificationRepository = require(...);
const sessionRepository = require(...);
```

Exemples :

```javascript
const User = require(...);
const userRepository = ...
const userName = ...
```

Une entité du domaine ne contient pas de préfixe.

```javascript
const User = require('../../User');

const myUser = new User({});
```

## Déclaration de routes

Ajout de tags et de notes au moment de la déclaration des routes de l'API.

```javascript
server.route([
    {
      method: 'GET',
      path: '/api/sessions',
      config: {
        handler: sessionController.find,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de consulter la liste de toutes les sessions (retourne un tableau avec n éléments)',
        ]
      }
    }
  ]
);
```

## Configuration

### Options d'environnement

Toute option de configuration de l'API susceptible de dépendre d'un environnement particulier (production, intégration, développement ou test), qu'elle soit fonctionnelle ou technique, DOIT être définie dans le fichier `/api/src/shared/config.js`.

```javascript
config.config.jsexports = (function() {

  const config = {
    
    // some options…
    
    someCategory: {
      optionA: 'valueA',
      optionB: 'valueB',
    },

    // yet other options…
    
  };
  
  return config;
})();


```

L'accès à une variable d'environnement NE DOIT PAS être effectué en dehors des fichiers `/api/lib/settings.config.

```javascript
// BAD

/* lib/plugins.js */
if (process.env.LOG_ENABLED === 'true') {
  consoleReporters.push('stdout');
}
```

```javascript
// GOOD

/* src/shared/config.js */
module.exports = (function() {
  const config = {
    logging: {
      enabled: (process.env.LOG_ENABLED === 'true'),
    },  
  };
  return config;
})();

/* lib/plugins.js */
const settings = require('./settings');
if (settings.logging.enabled) {
  consoleReporters.push('stdout');
}
```

Toute variable d'environnement DOIT être définie dans la page du wiki concernée.

### Surcharge d'une option par environnement

La surcharge d'une option pour un environnement dédié DOIT se faire par modification de la valeur plutôt que par instanciation d'un nouvel objet associé à la catégorie, afin de permettre le mécanisme de "valeur par défaut" et d'éviter la duplication de code inutile.

Soit la configuration par défaut suivante :

```javascript
const config = {
  someCategory: {
    optionA: 'valueA',
    optionB: 'valueB',
    optionC: 'valueC',
  },
};
```


```javascript
// BAD

if (process.env.NODE_ENV === 'test') {
  config.someCategory = {
    optionA: 'test_valueA',
    optionB: 'test_valueB',
    optionC: 'test_valueC',
  };
}
```

```javascript
// GOOD

if (process.env.NODE_ENV === 'test') {
  config.someCategory.optionA = 'test_valueA';
  config.someCategory.optionB = 'test_valueB';
  config.someCategory.optionC = 'test_valueC';
}
```
  
### Activation / désactivation des fonctionnalités

Dans le cas de fonctionnalités activables/désactivables, l'activation DOIT être gérée via une option booléenne `enabled`. 

```javascript
// BAD

mailing: {
  enabled: !!process.env.MAILING_ENABLED,
}
```

```javascript
// GOOD

mailing: {
  enabled: (process.env.MAILING_ENABLED === 'true'),
}
```

### Catégorisation des options

Toute option DEVRAIT être classée dans une catégorie spécifique afin d'aider à comprendre la finalité, l'usage ou le contexte d'exécution de celle-ci.

```javascript
// BAD

const config = {
  passwordValidationPattern: '^(?=.*\\p{L})(?=.*\\d).{8,}$',
};
```

```javascript
// GOOD

const config = {
  account: {
    passwordValidationPattern: '^(?=.*\\p{L})(?=.*\\d).{8,}$',
  },
};
```


## Tests

### ♻️ Tests unitaires

Un test unitaire doit passer sans base de données.


## Feature Toggles

### 🗺️ Problème

On veut pouvoir mettre en prod une fonctionnalité (exemple "Certification v2"),
tout en ayant la capacité de la désactiver sans générer une nouvelle version de
l'application pendant les premières semaines.

Sur des fonctionnalités longues à développer, on a aussi parfois le besoin de
livrer une partie du code en production sans que la fonctionnalité associée
soit visible par l'utilisateur.

### 🥚 Solution

Ajouter des variables d'environnement dont le nom est clairement identifié
comme _feature toggle_ en utilisant le préfixe `FT_` :

- `FT_ACTIVATE_CERTIFICATION_V2 = true`

Dans leur formulation, les variables d'env sont en tournure affirmative :

- `FT_USE_ONLY_V1_CERTIFICATION` plutôt que `FT_DONT_USE_V2_CERTIFICATION`.

Leur valeur par défaut est `false` de préférence (=> oublier de l'ajouter
conserve le comportement actuel de l'application).

⚠️ : il est important de supprimer ces bascules au plus tôt, dès que la feature
est bien installée en production (voir référence de Martin Fowler ci-dessous).
Les _features toggles_ ne sont pas des configurations qu'on souhaite conserver
longtemps, ce sont des bascules temporaires.

Avoir un préfixe bien identifié permet de faire la différence entre les
variables d'environnement de configuration durables et les variables
d'environnement de bascules temporaires.

⚠️ : cette solution de _feature toggle_ doit rester un pis aller quand on ne
sait pas découper finement une fonctionnalité. Ça ne doit pas devenir un
réflexe. On ne le fait que quand on n'a pas trouvé de meilleure solution.

### 📖 Informations supplémentaires

Pour tester en évitant une combinatoire ingérable pendant les tests (telle
fonctionnalité activée avec telle autre désactivée, ...), Martin Fowler
propose de ne tester que deux cas :

1. Tester avec toutes les bascules qui seront effectivement activées lors de la
   prochaine livraison
1. Tester avec toutes les bascules activées

Par exemple, si :

- J'ajoute la bascule `FT_ACTIVATE_CERTIFICATION_V2`,
- Et que cette bascule sera désactivée à la prochaine mise en prod

Alors :

1. Je teste avec `FT_ACTIVATE_CERTIFICATION_V2=false` (et l'état des autres FT tel qu'en production)
1. Je teste avec `FT_ACTIVATE_CERTIFICATION_V2=true` (et toutes les autres FT activées également)

### Références

- https://martinfowler.com/bliki/FeatureToggle.html
- https://martinfowler.com/articles/feature-toggles.html
- Voir un exemple d'ajout en PR #534, et de suppression en PR #563.
