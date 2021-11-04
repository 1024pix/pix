import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Invited | FillInParticipantExternalId', function () {
  setupTest();

  const model = {
    code: 'CODECAMPAIGN',
  };
  const participantExternalId = 'matricule123';

  let controller;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns/invited/fill-in-participant-external-id');
    controller.set('model', model);
    controller.router = { transitionTo: sinon.stub() };
  });

  describe('#onSubmitParticipantExternalId', () => {
    it('should transition to route campaigns.entrance when participant external id is fulfilled', () => {
      // when
      controller.actions.onSubmitParticipantExternalId.call(controller, participantExternalId);

      // then
      sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.entrance', controller.model);
    });
  });

  describe('#onCancel', () => {
    it('should transition to landing page', () => {
      // when
      controller.actions.onCancel.call(controller);

      // then
      sinon.assert.calledWithExactly(
        controller.router.transitionTo,
        'campaigns.campaign-landing-page',
        controller.get('model.code')
      );
    });
  });
});
