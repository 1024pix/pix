import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Unit | Controller | authenticated/users/get', function (hooks) {
  setupTest(hooks);
  module('#reassignAuthenticationMethod', function () {
    module('With Pole Emploi identity Provider', function () {
      test('should display good error message when an 422 error occurred', async function (assert) {
        // given
        const identityProvider = 'POLE_EMPLOI';
        const controller = this.owner.lookup('controller:authenticated.users.get');

        const originUserId = 1;
        const targetUserId = 2;

        const destroyRecordStub = sinon.stub();
        const rollbackAttributesStub = sinon.stub();
        destroyRecordStub
          .withArgs({
            adapterOptions: {
              reassignAuthenticationMethodToAnotherUser: true,
              targetUserId,
              originUserId,
              identityProvider,
            },
          })
          .rejects({ errors: [{ status: '422' }] });
        const authenticationMethods = [
          EmberObject.create({
            identityProvider,
            destroyRecord: destroyRecordStub,
            rollbackAttributes: rollbackAttributesStub,
          }),
        ];
        const user = EmberObject.create({ id: originUserId, authenticationMethods });

        controller.model = user;
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
