import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | pix-modal', function (hooks) {
  setupTest(hooks);

  module('#init', function () {
    test('should set the overlay as translucent', function (assert) {
      // given
      const component = this.owner.lookup('component:pix-modal');

      // when
      const translucentOverlay = component.get('translucentOverlay');

      // then
      assert.true(translucentOverlay);
    });
  });
});
