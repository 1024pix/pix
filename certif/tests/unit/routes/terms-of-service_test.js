import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | terms-of-service', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:terms-of-service');
    assert.ok(route);
  });
});
