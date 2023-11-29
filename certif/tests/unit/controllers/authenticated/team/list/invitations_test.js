import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/team/list/invitations', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/list/invitations');
  });

  module('#cancelInvitation', function () {
    test('cancel invitation', async function (assert) {
      // given
      const certificationCenterInvitation = {
        destroyRecord: sinon.stub(),
      };

      // when
      await controller.cancelInvitation(certificationCenterInvitation);

      // then
      assert.ok(certificationCenterInvitation.destroyRecord.called);
    });
  });
});
