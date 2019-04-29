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