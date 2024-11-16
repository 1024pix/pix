import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | companion', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    // given
    // when
    const route = this.owner.lookup('route:companion');

    // then
    assert.ok(route);
  });
});
