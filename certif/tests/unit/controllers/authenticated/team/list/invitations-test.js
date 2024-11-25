import { waitUntil } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/team/list/invitations', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/list/invitations');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#cancelInvitation', function () {
    test('cancel invitation and displays a success notification', async function (assert) {
      // given
      const certificationCenterInvitation = {
        destroyRecord: sinon.stub(),
      };
      controller.pixToast = { sendSuccessNotification: sinon.stub() };

      // when
      await controller.cancelInvitation(certificationCenterInvitation);

      // then
      assert.ok(certificationCenterInvitation.destroyRecord.called);
      assert.ok(
        controller.pixToast.sendSuccessNotification.calledWithExactly({
          message: 'L’invitation a bien été supprimée.',
        }),
      );
    });

    module('when an error occurs', function () {
      test('displays an error notification', async function (assert) {
        // given
        const certificationCenterInvitation = {
          destroyRecord: sinon.stub().rejects(),
        };
        controller.pixToast = { sendErrorNotification: sinon.stub() };

        // when
        await controller.cancelInvitation(certificationCenterInvitation);

        // then
        assert.ok(
          controller.pixToast.sendErrorNotification.calledWithExactly({
            message:
              'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
          }),
        );
      });
    });
  });

  module('#resendInvitation', function () {
    test('resends invitation and displays a success notification', async function (assert) {
      // given
      const certificationCenterInvitation = {
        save: sinon.stub(),
      };

      controller.pixToast = { sendSuccessNotification: sinon.stub() };

      // when
      await controller.resendInvitation(certificationCenterInvitation);

      // then
      assert.ok(certificationCenterInvitation.save.called);
      assert.ok(
        controller.pixToast.sendSuccessNotification.calledWithExactly({ message: "L'invitation a bien été renvoyée." }),
      );
    });

    module('when resending the same invitation multiple times without waiting X seconds (default to 5s)', function () {
      test('resends invitation and displays a success notification only twice', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationCenterInvitation = store.createRecord('certification-center-invitation');
        const waitForInMilliseconds = 10;

        controller.pixToast = { sendSuccessNotification: sinon.stub() };
        sinon.stub(certificationCenterInvitation, 'save').resolves();
        sinon.stub(ENV.APP, 'MILLISECONDS_BEFORE_MAIL_RESEND').value(waitForInMilliseconds);

        // when
        await controller.resendInvitation(certificationCenterInvitation);
        await controller.resendInvitation(certificationCenterInvitation);
        await waitUntil(
          async () => {
            return new Promise((resolve) => setTimeout(() => resolve(true), waitForInMilliseconds));
          },
          { timeout: waitForInMilliseconds },
        );
        await controller.resendInvitation(certificationCenterInvitation);

        // then
        assert.ok(certificationCenterInvitation.save.calledTwice);
        assert.ok(controller.pixToast.sendSuccessNotification.calledTwice);
      });
    });

    module('when an error occurs', function () {
      test('displays an error notification', async function (assert) {
        // given
        const certificationCenterInvitation = {
          save: sinon.stub().rejects(),
        };

        controller.pixToast = { sendErrorNotification: sinon.stub() };

        // when
        await controller.resendInvitation(certificationCenterInvitation);

        // then
        assert.ok(
          controller.pixToast.sendErrorNotification.calledWithExactly({
            message:
              'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
          }),
        );
      });
    });
  });
});
