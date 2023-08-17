import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | terms-of-service', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:terms-of-service');
    assert.ok(route);
  });
});
