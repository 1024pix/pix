import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/users/get', function (hooks) {
  setupTest(hooks);

  module('#reassignGarAuthenticationMethod', function () {
    test('should display good error message when an 422 error occurred', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.users.get');

      const targetUserId = 2;
      controller.model = { save: sinon.stub() };
      controller.send = sinon.stub();

      controller.model.save
        .withArgs({ adapterOptions: { reassignGarAuthenticationMethod: true, targetUserId } })
        .rejects({ errors: [{ status: '422' }] });

      controller.notifications = {
        success: sinon.stub(),
        error: sinon.stub(),
      };

      controller.notifications.error.resolves();

      // when
      await controller.reassignGarAuthenticationMethod(targetUserId);

      // then
      sinon.assert.calledWith(controller.notifications.error, controller.ERROR_MESSAGES.STATUS_422);
      assert.ok(true);
    });
  });
});
