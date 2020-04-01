import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Landing Page', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns/campaign-landing-page');
    controller.transitionToRoute = sinon.stub();
  });

  describe('#startCampaignParticipation', () => {

    it('should redirect to route campaigns.start-or-resume', function() {
      // given
      controller.set('model', { code: 'konami' });
      controller.set('participantExternalId', 'a73at01r3');

      // when
      controller.actions.startCampaignParticipation.call(controller);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume', 'konami', {
        queryParams: {
          hasSeenLanding: true,
          participantExternalId: 'a73at01r3'
        }
      });
    });
  });
});
