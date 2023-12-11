import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import sinon from 'sinon';
import ENV from 'pix-certif/config/environment';

import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/team/list/invitations', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

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
      controller.notifications = { success: sinon.stub() };

      // when
      await controller.cancelInvitation(certificationCenterInvitation);

      // then
      assert.ok(certificationCenterInvitation.destroyRecord.called);
      assert.ok(controller.notifications.success.calledWithExactly('L’invitation a bien été supprimée.'));
    });

    module('when an error occurs', function () {
      test('displays an error notification', async function (assert) {
        // given
        const certificationCenterInvitation = {
          destroyRecord: sinon.stub().rejects(),
        };
        controller.notifications = { error: sinon.stub() };

        // when
        await controller.cancelInvitation(certificationCenterInvitation);

        // then
        assert.ok(
          controller.notifications.error.calledWithExactly(
            'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
          ),
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

      controller.notifications = { success: sinon.stub() };

      // when
      await controller.resendInvitation(certificationCenterInvitation);

      // then
      assert.ok(certificationCenterInvitation.save.called);
      assert.ok(controller.notifications.success.calledWithExactly("L'invitation a bien été renvoyée."));
    });

    module('when resending the same invitation multiple times without waiting X seconds (default to 5s)', function () {
      test('resends invitation and displays a success notification only twice', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationCenterInvitation = store.createRecord('certification-center-invitation');
        const waitForInMilliseconds = 10;

        controller.notifications = { success: sinon.stub() };
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
        assert.ok(controller.notifications.success.calledTwice);
      });
    });

    module('when an error occurs', function () {
      test('displays an error notification', async function (assert) {
        // given
        const certificationCenterInvitation = {
          save: sinon.stub().rejects(),
        };

        controller.notifications = { error: sinon.stub() };

        // when
        await controller.resendInvitation(certificationCenterInvitation);

        // then
        assert.ok(
          controller.notifications.error.calledWithExactly(
            'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
          ),
        );
      });
    });
  });
});
