# Ember.js

### Sommaire

1. [Routes](#routes)
   * [Le fichier `router.js`](#le-fichier-routerjs)
   * [Utilisation de transitionTo](#utilisation-de-transitionto)


## Routes

### Le fichier `router.js`

Voici des conventions à respecter dans le fichier `router.js`, qui est le fichier contenant les déclarations des routes de l'application :
*  Préfixer le `path` d'une route par un caractère `/`

```javascript
// BAD
this.route('sessions', function() {
  this.route('index', { path: '' });
  this.route('list', { path: 'liste' });
  this.route('update', { path: ':session_id/modification' });
});

// GOOD
this.route('sessions', function() {
  this.route('index', { path: '/' });
  this.route('list', { path: '/liste' });
  this.route('update', { path: '/:session_id/modification' });
});
```

*  Positionner la route "absorbe-tout" du router en dernière position. Cette route permet de capter les visites d'un utilisateur vers des routes qui n'existent pas :

```javascript
// BAD
Router.map(function() {
  this.route('login', { path: '/connexion' });
  this.route('not-found', { path: '/*path' });
  this.route('logout', { path: '/deconnexion' });

  this.route('authenticated', { path: '/' }, function () {
    /* ... */
  });
});

// GOOD
Router.map(function() {
  this.route('login', { path: '/connexion' });
  this.route('logout', { path: '/deconnexion' });

  this.route('authenticated', { path: '/' }, function () {
    /* ... */
  });
  
  this.route('not-found', { path: '/*path' });
});
```

* Toujours définir un comportement sur la route `index` de chaque groupe de routes :

Dans **Ember**, toutes les routes "parentes" présentent une route à la racine, appelée la route `index`.
Qu'elle soit explicitement déclarée ou pas, elle existera toujours. Si aucun comportement ou affichage spécifique n'est souhaité,
il faut au moins penser à définir le hook `beforeModel()` et d'y positionner une redirection.
La route faisant office d'`index` au sein d'un groupe de routes est celle dont le `path` vaut '`/`'.
Pour plus d'informations, se référer à la [documentation](https://guides.emberjs.com/release/routing/defining-your-routes/#toc_index-routes).

```javascript
// router.js
this.route('participation', { path: '/:campaign_participation_id' }, function() {
  // L'URL participation/123 est visitable, même si elle n'est pas explicitement déclarée
  this.route('results', { path: '/resultats' });
  this.route('analysis', { path: '/analyse' });
});

// Si l'on ne souhaite pas définir une vue pour la page participation/123,
// ne pas oublier de définir une redirection

// routes/participation/index.js
export default class ParticipationIndexRoute extends Route {
  beforeModel(params) {
    this.transitionTo('participation.results', params.campaign_participation_id);
  }
}
```

### Utilisation de transitionTo

Éviter les `transistionTo` dans le hook `model()`. Privilégier leur utilisation dans l’`afterModel()`, une fois que le modèle est chargé.

```javascript
// BAD
export default class MyRoute extends Route {
  async model(params) {
    const user = await this.store.findRecord('user', params.user_id);
    if (user.isHappy) {
      return this.transitionTo('happy_place');
    }
    return user;
  }
};

// GOOD
export default class MyRoute extends Route {
  model(params) {
    return this.store.findRecord('user', params.user_id);
  }

  afterModel(model) {
    if (model.isHappy) {
      return this.transitionTo('happy_place');
    }
  }
}
```


