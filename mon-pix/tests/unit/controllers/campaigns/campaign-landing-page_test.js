import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Landing Page', function () {
  setupTest();

  let controller;

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns/campaign-landing-page');
    controller.router = { transitionTo: sinon.stub() };
  });

  describe('#startCampaignParticipation', () => {
    it('should redirect to route campaigns.access', function () {
      // given
      controller.set('model', { code: 'konami' });

      // when
      controller.actions.startCampaignParticipation.call(controller);

      // then
      sinon.assert.calledWith(controller.router.transitionTo, 'campaigns.access', 'konami');
    });
  });
});
