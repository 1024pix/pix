import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | authenticated/places', function (hooks) {
  setupTest(hooks);

  test('it has access to currentUser', function (assert) {
    const controller = this.owner.lookup('controller:authenticated/places');
    assert.ok(controller.currentUser);
  });
});
