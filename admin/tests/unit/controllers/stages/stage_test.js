import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/stages/stage', function (hooks) {
  setupTest(hooks);

  module('#toggleEditMode', function () {
    test('should change isEditMode to true', async function (assert) {
      //given
      const controller = this.owner.lookup('controller:authenticated.stages.stage');
      controller.isEditMode = false;
      const expectedValue = true;
      //when
      await controller.toggleEditMode();

      //then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.isEditMode, expectedValue);
    });
  });
});
