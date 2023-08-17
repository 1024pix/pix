import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | terms-of-service', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:terms-of-service');
    assert.ok(controller);
  });
});
