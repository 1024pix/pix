import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/users/get/certification-center-memberships', function (hooks) {
  setupTest(hooks);

  let UserCertificationCenterMembership, notifications;

  hooks.beforeEach(function () {
    UserCertificationCenterMembership = {
      destroyRecord: sinon.stub(),
      rollbackAttributes: sinon.stub(),
    };
    notifications = {
      error: sinon.stub(),
      success: sinon.stub(),
    };
  });

  module('#disableCertificationCenterMembership', function () {
    module('when users certification center membership is disabled', function () {
      test('it calls success method from notifications service', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/users/get/certification-center-memberships');
        controller.notifications = notifications;
        UserCertificationCenterMembership.destroyRecord.resolves();

        // when
        await controller.disableCertificationCenterMembership(UserCertificationCenterMembership);

        // then
        sinon.assert.calledOnce(UserCertificationCenterMembership.destroyRecord);
        sinon.assert.calledOnce(controller.notifications.success);
        sinon.assert.notCalled(controller.notifications.error);
        assert.ok(true);
      });
    });

    module('when an error occurs during a user certification center membership deactivation', function () {
      test('it calls error method from notifications service', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/users/get/certification-center-memberships');
        controller.notifications = notifications;
        UserCertificationCenterMembership.destroyRecord.rejects();

        // when
        await controller.disableCertificationCenterMembership(UserCertificationCenterMembership);

        // then
        sinon.assert.calledOnce(UserCertificationCenterMembership.destroyRecord);
        sinon.assert.notCalled(controller.notifications.success);
        sinon.assert.calledOnce(controller.notifications.error);
        assert.ok(true);
      });
    });
  });
});
