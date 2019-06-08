import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/certifications/sessions/info/list', function(hooks) {

  setupTest(hooks);

  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    assert.ok(controller);
  });

});
