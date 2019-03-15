# Contribuer à Pix

#### Table des matières

[Notre utilisation de Git](#notre-utilisation-de-git)
* [Branche dev](#branche-dev)
* [Nommage](#nommage)
* [Nommage des commits](#nommage-des-commits)
* [Node.js](#nodejs)

[Guide de style JavaScript](#guide-de-style-javascript)
* [API](#api)
* [-> Global](#global)
* [-> Nommage](#nommage)
* [-> Routes](#routes)
* [-> Controllers](#controllers)
* [-> Usecases](#usecases)

[Guide de création Front-End](#guide-de-création-front-end)
* [Accessibilité](#accessibilité)
* [CSS](#css)
* [-> Couleurs](#couleurs)
* [-> Positionnement](#positionnement)
* [-> Responsive design](#responsive-design)
* [-> Structure de classes](#structure-des-classes)
* [-> Unités](#unités)
* [Javascript Ember.js](#javascript-emberjs)
* [-> Components](#components)
* [-> Routes](#routes)

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
#### Tests

Test unitaire : un test unitaire doit passer sans base de données.

## Guide de création Front-End

### Accessibilité

##### Utilisation des balises <h*> </h*>

Peu importe l'apparence des h*, les personnes qui voient les titres comprennent. En revanche les personnes qui naviguent avec le clavier au __voiceOver__ ont besoin que le html soit explicite le plus possible pour que leur outil sache les lire correctement.

### CSS

##### Couleurs

Rassembler les couleurs dans un seul et même fichier scss (palette.scss ou colors.scss)

##### Positionnement

Éviter le plus possible les valeurs négatives de margin, padding, etc. et privilégier les positions absolutes

```scss
// BAD
.my-class {
  display: flex;
  margin-top: -9875654px;
}

// GOOD
.my-class {
  position: absolute;
  top: 20px;
  left: 5px;
  right: 24132px;
  bottom: 12345px;
}

```

##### Responsive design

La largeur doit prendre soit __100%__ soit une __largeur maximale__ fixe définie en px.
```scss
// BAD
.my-class {
  width: 70%;
}

// GOOD 
.my-class {
  width: 100%;
}

// ALSO GOOD 
.my-class {
  max-width: 1200px;
}
```

##### Structure de classes

###### Convention Block__Element--Modifier (BEM)

Privilégier le plus possible le [pattern BEM](http://getbem.com/).

###### Définition de responsabilités 

Dans une recherche de réutilisabilité des classes css, il faut dans __l'idéal__ que :
* Le bloc comporte le __style__.
* L’élément comporte le __positionnement__.
* Le modifier modifie de façon **mineure** certaines descriptions de style du bloc.
* Une modification majeure marque le __besoin de créer une nouvelle classe__ / un nouvel “objet” css

Ces "_règles_" ne vont pas forcément s'appliquer sur des composants uniques.

###### Nommage des classes 
Quand on reprend l'élément pour devenir un block, il n'est pas obligatoire de reprendre l'élément parent. 

Par exemple, avec le parent `profilv2-header__hexagon-score`, l'enfant doit devenir `hexagon-score__content`. On n'est pas obligé de l'appeler `profilv2-header-hexagon-score__content`. 

Selon BEM, les classes ne doivent pas refléter la structure arborescente du DOM, et être le plus flat possible. Puisque par définition d'un block, tout ce qui est de la forme block__element-n est un tout indivisible.

###### Imbrication en poupées russes

Privilégier le plus possible la création de classes filles __visuellement plus petites__ que leur classe parente, à l'image des poupées russes.

###### Séparation des responsabilités

Séparer le style du positionnement. On peut par exemple utiliser `@mixin`

```scss
// BAD
.hexagon-score-content__pix-score {
  position: absolute;
  width: 100%;
  top: 40px;
  color: $black;
  font-family: $font-open-sans;
  font-size: 4.6rem;
}

// GOOD
@mixin hexagon-score-pix-score {
  color: $black;
  font-family: $font-open-sans;
  font-size: 4.6rem;
}

.hexagon-score-content__pix-score {
  @include hexagon-score-pix-score;
  position: absolute;
  width: 100%;
  top: 40px;
}

```

##### Unités

Utilisation des __rem__ pour les fonts: size, lettering, letter-spaces.  
Utilisation des __px__ pour le positionnement: padding, border, margin.

```
.my-class {
 size: 1.3em;
 padding: 10px 12px;
}
```

### Javascript Ember.js

##### Components

###### Création de classes css
Privilégier la création de classes CSS dans le `.hbs` plutôt que dans le `.js`

```javascript
// BAD 
export default Component.extend({
  classNames: ['hexagon-score'], // qui va rajouter cette class à la div créée par Ember pour injecter le component
});
```

```html
// BAD
<div class="hexagon-score__content">
  <div class="hexagon-score-content__title">PIX</div>
  <div class="hexagon-score-content__pix-score">{{score}}</div>
  <div class="hexagon-score-content__pix-total">1024</div>
</div>
```

```javascript
// GOOD
export default Component.extend({
  // component stuff
});
```

```html
// GOOD
<div class="hexagon-score">
  <div class="hexagon-score__content">
    <div class="hexagon-score-content__title">PIX</div>
    <div class="hexagon-score-content__pix-score">{{score}}</div>
    <div class="hexagon-score-content__pix-total">1024</div>
  </div>
</div>
```

##### Routes

###### Accéder à une ressource

Privilégier l'utilisation de `this.store` plutôt que `this.get('store')`

```javascript
// BAD
export default Route.extend({
  model() {
    const store = this.get('store');
    return store.findRecord('user', this.get('session.data.authenticated.userId'));
  },
});

// GOOD
export default Route.extend({
  model() {
    return this.store.findRecord('user', this.get('session.data.authenticated.userId'));
  },
});
```

###### Utilisation de transitionTo

Éviter les `transistionTo` dans le modèle. Privilégier leur utilisation dans l’`afterModel()`, une fois que le modèle est chargé.

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
```
