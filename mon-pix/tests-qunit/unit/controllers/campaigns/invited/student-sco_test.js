import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | campaigns/invited/student-sco', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.invited.student-sco');
    controller.router = { transitionTo: sinon.stub() };
    controller.set('model', { code: 'AZERTY999' });
  });

  module('#reconcile', function (hooks) {
    let schoolingRegistration;

    hooks.beforeEach(function () {
      schoolingRegistration = { save: sinon.stub() };
    });

    module('When withReconciliation is false', function () {
      test('should run reconciliation checks and not redirect', async function (assert) {
        // given
        schoolingRegistration.save.resolves();
        const adapterOptions = { withReconciliation: false };

        // when
        await controller.actions.reconcile.call(controller, schoolingRegistration, adapterOptions);

        // then
        assert.expect(0);
        sinon.assert.calledOnce(schoolingRegistration.save);
        sinon.assert.notCalled(controller.router.transitionTo);
      });
    });

    module('When withReconciliation is true', function () {
      test('should associate user with student and redirect to campaigns.invited.fill-in-participant-external-id', async function (assert) {
        // given
        schoolingRegistration.save.resolves();
        const adapterOptions = { withReconciliation: true };

        // when
        await controller.actions.reconcile.call(controller, schoolingRegistration, adapterOptions);

        // then
        assert.expect(0);
        sinon.assert.calledOnce(schoolingRegistration.save);
        sinon.assert.calledWith(
          controller.router.transitionTo,
          'campaigns.invited.fill-in-participant-external-id',
          'AZERTY999'
        );
      });
    });
  });
});
