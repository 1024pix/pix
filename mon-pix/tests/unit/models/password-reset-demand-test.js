import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | password reset demand', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('password-reset-demand');
    assert.ok(model);
  });
});
