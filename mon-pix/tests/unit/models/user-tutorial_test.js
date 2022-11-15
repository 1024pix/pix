import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | user-saved-tutorial model', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('user-saved-tutorial');
    assert.ok(model);
  });
});
