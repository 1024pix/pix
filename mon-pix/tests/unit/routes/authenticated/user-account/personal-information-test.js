import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | user-account/personal-information', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/user-account/personal-information');
    assert.ok(route);
  });
});
