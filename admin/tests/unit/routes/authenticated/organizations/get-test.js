import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/organizations/get', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/organizations/get');
    assert.ok(route);
  });
});
