import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | user-tutorials/recommended', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:authenticated.user-tutorials.recommended');
    assert.ok(route);
  });
});
