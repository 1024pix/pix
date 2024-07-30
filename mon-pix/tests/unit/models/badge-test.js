import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | Badge', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const badge = store.createRecord('badge');

    assert.ok(badge);
  });
});
