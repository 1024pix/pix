import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | user-account/language', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/user-account/language');
    assert.ok(route);
  });
});
