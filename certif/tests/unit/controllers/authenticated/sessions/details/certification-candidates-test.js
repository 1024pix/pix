import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/details/certification-candidates', function(hooks) {
  setupTest(hooks);

  test('should create the controller', function(assert) {
    const controller = this.owner.lookup('controller:authenticated/sessions/details/certification-candidates');
    assert.ok(controller);
  });
});
