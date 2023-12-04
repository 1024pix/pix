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
  });
});
