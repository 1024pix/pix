import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

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
