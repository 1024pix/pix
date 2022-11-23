import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | profile', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:authenticated.profile');
    assert.ok(route);
  });
});
