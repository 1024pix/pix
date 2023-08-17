import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | authenticated/target-profile/target-profile/stages/stage', function (hooks) {
  setupTest(hooks);

  module('#toggleEditMode', function () {
    test('should change isEditMode to true', async function (assert) {
      //given
      const controller = this.owner.lookup('controller:authenticated.target-profiles.target-profile.stages.stage');
      controller.isEditMode = false;
      const expectedValue = true;
      //when
      await controller.toggleEditMode();

      //then
      assert.strictEqual(controller.isEditMode, expectedValue);
    });
  });
});
