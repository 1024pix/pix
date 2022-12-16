import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | user-account/connection-methods', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/user-account/connection-methods');
    assert.ok(route);
  });
});
