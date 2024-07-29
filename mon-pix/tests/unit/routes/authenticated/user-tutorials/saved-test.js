import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | user-tutorials/saved', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:authenticated.user-tutorials.saved');
    assert.ok(route);
  });
});
