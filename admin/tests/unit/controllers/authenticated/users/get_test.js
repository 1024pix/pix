import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/users/get', function (hooks) {
  setupTest(hooks);
  module('#reassignAuthenticationMethod', function () {
    module('With Pole Emploi identity Provider', function () {
      test('should display good error message when an 422 error occurred', async function (assert) {
        // given
        const identityProvider = 'POLE_EMPLOI';
        const controller = this.owner.lookup('controller:authenticated.users.get');

        const targetUserId = 2;
        const authenticationMethodId = 10;

        controller.model = { save: sinon.stub() };
        controller._getUserAuthenticationMethodIdByIdentityProvider = sinon.stub().returns(authenticationMethodId);
        controller.send = sinon.stub();
        controller.model.save
          .withArgs({
            adapterOptions: {
              reassignAuthenticationMethodToAnotherUser: true,
              targetUserId,
              authenticationMethodId,
              identityProvider,
            },
          })
          .rejects({ errors: [{ status: '422' }] });
        controller.notifications = {
          success: sinon.stub(),
          error: sinon.stub(),
        };
        controller.notifications.error.resolves();

        // when
        await controller.reassignAuthenticationMethod({ targetUserId, identityProvider });

        // then
        sinon.assert.calledWith(controller.notifications.error, controller.ERROR_MESSAGES.STATUS_422.POLE_EMPLOI);
        assert.ok(true);
      });
    });
  });
});
