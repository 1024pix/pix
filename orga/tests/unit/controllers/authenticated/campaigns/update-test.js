import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | authenticated/campaigns/update', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:authenticated/campaigns/update');
    assert.ok(controller);
  });
});
