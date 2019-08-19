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

Une entité du domaine ne contient pas de préfix.

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

## Utilisation de transitionTo

Éviter les `transistionTo` dans le hook `model()`. Privilégier leur utilisation dans l’`afterModel()`, une fois que le modèle est chargé.

```javascript
// BAD
export default Route.extend({
  model() {
    const store = this.get('store');
    return store.findRecord('user', this.get('session.data.authenticated.userId'))
      .then((user) => {
        if (user.get('organizations.length') > 0) {
          return this.transitionTo('board');
        }
        return user;
      });
  },
});

// GOOD
export default Route.extend({
  model() {
    return this.store.findRecord('user', this.get('session.data.authenticated.userId'));
  },

  afterModel(model) {
    if (model.get('organizations.length') > 0) {
      return this.transitionTo('board');
    }
  }
});
```

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
fonctionnallité activée avec telle autre désactivée, ...), Martin Fowler
propose de ne tester que deux cas :

1. Tester avec toutes les bascules qui seront effectivement activées lors de la
   prochaine livraison
1. Tester avec toutes les bascules activées

Par exemple, si :

- J'ajoute la bascule `FT_ACTIVATE_CERTIFICATION_V2`,
- Et que cette bascule sera désactivée à la prochaine mise en prod

Alors :

1. Je teste avec `FT_ACTIVATE_CERTIFICATION_V2=false` (et l'état des autres FT telles qu'en prod)
1. Je teste avec `FT_ACTIVATE_CERTIFICATION_V2=true` (et toutes les autres FT activées aussi)

### Références

- https://martinfowler.com/bliki/FeatureToggle.html
- https://martinfowler.com/articles/feature-toggles.html
- Voir un exemple d'ajout en PR #534, et de suppression en PR #563.
