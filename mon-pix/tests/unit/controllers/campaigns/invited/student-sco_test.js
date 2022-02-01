import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/invited/student-sco', function () {
  setupTest();

  let controller;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.invited.student-sco');
    controller.router = { transitionTo: sinon.stub() };
    controller.set('model', { code: 'AZERTY999' });
  });

  describe('#reconcile', function () {
    let schoolingRegistration;

    beforeEach(function () {
      schoolingRegistration = { save: sinon.stub() };
    });

    context('When withReconciliation is false', function () {
      it('should run reconciliation checks and not redirect', async function () {
        // given
        schoolingRegistration.save.resolves();
        const adapterOptions = { withReconciliation: false };

        // when
        await controller.actions.reconcile.call(controller, schoolingRegistration, adapterOptions);

        // then
        sinon.assert.calledOnce(schoolingRegistration.save);
        sinon.assert.notCalled(controller.router.transitionTo);
      });
    });

    context('When withReconciliation is true', function () {
      it('should associate user with student and redirect to campaigns.invited.fill-in-participant-external-id', async function () {
        // given
        schoolingRegistration.save.resolves();
        const adapterOptions = { withReconciliation: true };

        // when
        await controller.actions.reconcile.call(controller, schoolingRegistration, adapterOptions);

        // then
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
