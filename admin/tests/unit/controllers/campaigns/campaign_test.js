import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/campaigns/campaign', function (hooks) {
  setupTest(hooks);

  module('#toggleEditMode', function () {
    test('should change isEditMode to true', async function (assert) {
      //given
      const controller = this.owner.lookup('controller:authenticated.campaigns.campaign');
      controller.isEditMode = false;
      const expectedValue = true;

      //when
      await controller.toggleEditMode();

      //then
      assert.strictEqual(controller.isEditMode, expectedValue);
    });
  });
});
