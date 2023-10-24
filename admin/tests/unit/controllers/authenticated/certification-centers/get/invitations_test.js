import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authenticated/certification-centers/get/invitations', function (hooks) {
  setupTest(hooks);

  let controller;
  let store;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/certification-centers/get/invitations');
    controller.model = { certificationCenterId: 1 };
    store = this.owner.lookup('service:store');
  });

  module('#createInvitation', function () {
    test('it should send a notification error if an error occurred', async function (assert) {
      // given
      const anError = Symbol('an error');
      store.queryRecord = sinon.stub().rejects(anError);
      controller.userEmailToInvite = 'anemail@exmpla.net';
      const notifyStub = sinon.stub();
      class ErrorResponseHandler extends Service {
        notify = notifyStub;
      }
      this.owner.register('service:error-response-handler', ErrorResponseHandler);
      const customErrors = Symbol('custom errors');
      controller.CUSTOM_ERROR_MESSAGES = customErrors;

      // when
      await controller.createInvitation('fr', 'MEMBER');

      // then
      assert.ok(notifyStub.calledWithExactly(anError, customErrors));
    });

    module('when the email is valid', function () {
      test('it creates a certification center invitation', async function (assert) {
        // given
        const queryRecordStub = sinon.stub();
        store.queryRecord = queryRecordStub;

        controller.userEmailToInvite = 'yuno@clover.net';
        const language = 'fr';
        const role = 'MEMBER';

        // when
        await controller.createInvitation(language, role);

        //then
        assert.ok(
          queryRecordStub.calledWith('certification-center-invitation', {
            email: 'yuno@clover.net',
            language,
            role,
            certificationCenterId: 1,
          }),
        );
      });
    });
  });

  module('When there are pending Pix Certif invitations', function () {
    test('it should display an error message when it is not possible to cancel a certification center invitation', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certification-centers/get/invitations');

      const store = this.owner.lookup('service:store');
      store.createRecord('certificationCenterInvitation', {
        destroyRecord: sinon.stub().rejects('an error'),
      });

      const notificationErrorStub = sinon.stub();
      class NotificationsStub extends Service {
        error = notificationErrorStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      await controller.cancelCertificationCenterInvitation();

      // then
      sinon.assert.calledWith(notificationErrorStub, 'Une erreur s’est produite, veuillez réessayer.');
      assert.ok(true);
    });
  });
});
