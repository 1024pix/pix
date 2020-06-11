import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/fill-in-id-pix', function() {

  setupTest();

  let route;

  beforeEach(function() {
    route = this.owner.lookup('route:campaigns/fill-in-id-pix');
  });

  describe('#start', function() {

    const participantExternalId = 'Identifiant professionnel';

    beforeEach(function() {
      route.transitionTo = sinon.stub();
    });

    it('should redirect to start-or-resume page', async function() {
      // when
      const campaign = 'someCampaign';
      route.modelFor = sinon.stub().returns(campaign);
      await route.start(participantExternalId);

      // then
      sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume', campaign, { queryParams: { participantExternalId } });
    });
  });
});
