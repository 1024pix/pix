# Ember

## Général

### Utilisation de transitionTo

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

## Tests

### Tester le texte traduit par EmberIntl

Afin d'être complètement agnostique de la locale de l'environnement de test, on privilégiera le fait de tester les textes traduits en passant
par le `helper` `t` fourni par `ember-intl/test-support`. Ainsi, on s'affranchira de la contrainte de langue et on se concentrera plutôt
sur la clé de traduction attendue sur un test donné ([procédé documenté dans la doc EmberIntl](https://ember-intl.github.io/ember-intl/versions/master/docs/guide/testing#t-key-options-)).

Pour tester les textes traduits dans les templates :
```js
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | hello', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  
  test('it should display a welcome message', async function (assert) {
    // when
    await render(hbs`<Hello/>`);

    // then
    assert.dom().hasText(t('pages.hello.welcome-message'));
  });
});
```

De même, pour tout autre texte traduit par un autre biais :
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Unit | Service | Error messages', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('should return the message when error code is found', function(assert) {
    // given
    const errorMessages = this.owner.lookup('service:errorMessages');
    
    // when
    const message = errorMessages.getErrorMessage('CAMPAIGN_NAME_IS_REQUIRED');
    
    // then
    assert.equal(message, t('api-error-messages.campaign-creation.name-required'));
  });
});
```

Enfin, si vraiment on souhaite tester une traduction spécifique, il faut alors spécifier la locale lors du setup de test :
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Unit | Service | Error messages', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'fr-fr');

  test('should return the message when error code is found', function(assert) {
    // given
    const errorMessages = this.owner.lookup('service:errorMessages');
    
    // when
    const message = errorMessages.getErrorMessage('CAMPAIGN_NAME_IS_REQUIRED');
    
    // then
    assert.equal(message, 'Le nom de la campagne est obligatoire');
  });
});
```
*Note: La pratique n'est pas recommandée sauf exception*


