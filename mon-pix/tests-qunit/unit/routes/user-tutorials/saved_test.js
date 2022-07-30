import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | user-tutorials/saved', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:user-tutorials.saved');
    assert.ok(route);
  });
});
