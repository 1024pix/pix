# Contribuer à Pix

#### Table des matières

- [Notre utilisation de Git](#notre-utilisation-de-git)
- [Guide de style JavaScript](#guide-de-style-javascript)


## Notre utilisation de Git

### Branche `dev`

⚠️ On ne merge jamais `dev` dans une autre branche ⚠️

### Nommage

Tests, commits, branches : en anglais

Description des Pull Requests : en français

### Nommage des commits

Exemples :

```
[po-31] Enlarge text width on details page

[pf-509] Check email domain before submitting address to Mailjet

[BSR] Add markdown templating for custom landing page text display

[BUGFIX] Problème de style sous IE (PF-440).
```

### Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`

## Guide de style JavaScript

### API

#### Global
Sauf exception, privilégier l'ordre alphabétique pour trier une suite de déclarations, require, ...
```
// BAD
const sessionRepository = require(...);
const assessmentRepository = require(...);
const certificationRepository = require(...);

// GOOD
const assessmentRepository = require(...);
const certificationRepository = require(...);
const sessionRepository = require(...);
```


#### Nommage

##### Entités

###### Domaine
Une entité du domaine ne contient pas de préfix.
```
const User = require(../../User);

const myUser = new User({});
```

###### Bookshelf
Une entité bookshelf doit être préfixée par "Bookshelf".
```
const BookshelfUser = require(../../User);

const myBookshelfUser = new BookshelfUser({});
```

##### Déclarations
 - les classes prennent une majuscule au début.
 - les modules et variables prennent une minuscule au début.

Exemples :

```
const User = require(...)

const userRepository = ...

const userName = ...
```

#### Routes

Ajouter de tags et de notes au moment de la déclaration des routes de l'API.

```
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

#### Controllers

Un controlleur ne peux __pas__ appeler __2__ usecases séquentiellement.

#### Usecases
Un usecase:
 - est une fonction
 - [utilise le pattern RORO](https://medium.freecodecamp.org/elegant-patterns-in-modern-javascript-roro-be01e7669cbd)
 - require seulement des éléments venant du domaine
 - récupèrent leurs dépendances vers l'extérieur en tant que paramètres donnée à la fonction

```
// BAD
const myRepository = require(../../../infrastructure/repositories/myRepository);

// GOOD
const myService = require(../../../domain/services/myService);

module.exports = function myUseCase({ param1, param2, param3, repo1, repo2 }) {
...
}
```

### FRONT

#### CSS

##### Couleurs

Rassembler les couleurs dans un seul et même fichier scss (palette.scss ou colors.scss)

##### Unités

Utilisation des __rem__ pour les fonts: size, lettering, letter-spaces.  
Utilisation des __px__ pour le positionnement: padding, border, margin.

```
.my-class {
 size: 1.3em;
 padding: 10px 12px;
}
```
