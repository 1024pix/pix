import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/campaigns/details/participants', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:authenticated/campaigns/details/participants');
    assert.ok(controller);
  });
});
