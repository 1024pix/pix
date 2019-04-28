# Nommage API

## Déclaration de variables

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

## Préfix

Une entité du domaine ne contient pas de préfix.
```javascript
const User = require('../../User');

const myUser = new User({});
```
