# Déclaration des variables

## API

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
const User = require(...)
const userRepository = ...
const userName = ...
```

## Routes

Ajouter de tags et de notes au moment de la déclaration des routes de l'API.

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
