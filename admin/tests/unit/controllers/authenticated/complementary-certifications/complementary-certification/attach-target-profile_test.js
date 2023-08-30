import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | attach-target-profile', function (hooks) {
  setupTest(hooks);

  module('#onChange', function () {
    test('it should reset the selectedTargetProfile', async function (assert) {
      // given
      const controller = this.owner.lookup(
        'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
      );

      // when
      controller.onReset();

      // then
      assert.strictEqual(controller.selectedTargetProfile, undefined);
      assert.strictEqual(controller.targetProfileBadges, undefined);
    });
  });
});
