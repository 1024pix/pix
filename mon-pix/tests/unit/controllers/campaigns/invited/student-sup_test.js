import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/invited/student-sup', function () {
  setupTest();

  let controller;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.invited.student-sup');
    controller.router = { transitionTo: sinon.stub() };
    controller.set('model', { code: 'AZERTY999' });
  });

  describe('#reconcile', function () {
    let schoolingRegistration;

    beforeEach(function () {
      schoolingRegistration = { save: sinon.stub() };
    });

    it('should associate user with student and redirect to campaigns.invited.fill-in-participant-external-id', async function () {
      // given
      schoolingRegistration.save.resolves();

      // when
      await controller.actions.reconcile.call(controller, schoolingRegistration);

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
