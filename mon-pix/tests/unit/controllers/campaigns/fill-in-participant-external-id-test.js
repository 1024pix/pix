import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | FillInParticipantExternalId', function() {

  setupTest();

  const model = {
    code: 'CODECAMPAIGN',
  };
  const participantExternalId = 'matricule123';

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns/fill-in-participant-external-id');
    controller.set('model', model);
    controller.transitionToRoute = sinon.stub();
  });

  describe('#onSubmitParticipantExternalId', () => {
    it('should transition to route campaigns.start-or-resume when participant external id is fulfilled', () => {
      // when
      controller.actions.onSubmitParticipantExternalId.call(controller, participantExternalId);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume', controller.model, { queryParams: { participantExternalId } });
    });
  });

  describe('#onCancel', () => {
    it('should transition to start or resume', () => {
      // when
      controller.actions.onCancel.call(controller);

      // then
      sinon.assert.calledWithExactly(controller.transitionToRoute, 'campaigns.start-or-resume', controller.get('model.code'), { queryParams: { hasUserSeenLandingPage: false } });
    });
  });
});
