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


