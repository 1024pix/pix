import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/certifications/sessions/info/index', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/index');
    assert.ok(controller);
  });
});
