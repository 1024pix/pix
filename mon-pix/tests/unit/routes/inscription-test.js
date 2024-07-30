import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | inscription', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:inscription');
    assert.ok(route);
  });
});
