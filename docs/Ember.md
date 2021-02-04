# Ember.js

### Sommaire

* [Utilisation de transitionTo](#utilisation-de-transitionto)

## Utilisation de transitionTo

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


