import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | login', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:login');
    assert.ok(route);
  });
});
