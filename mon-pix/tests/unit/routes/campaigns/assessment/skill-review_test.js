import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Campaign | Assessment | Skill review', function() {
  setupTest();

  let route;
  const campaign = { id: 123456, code: 'NEW_CODE' };
  const user = { id: 567890 };
  const storeStub = {
    queryRecord: sinon.stub(),
  };
  const currentUserStub = { user };

  beforeEach(function() {
    route = this.owner.lookup('route:campaigns.assessment.skill-review');
    route.modelFor = sinon.stub().returns(campaign);
    route.transitionTo = sinon.stub();
    route.store = storeStub;
    route.currentUser = currentUserStub;
  });

  describe('#model', function() {
    context('when no participation', function() {
      beforeEach(function() {
        storeStub.queryRecord.rejects({ errors: [ { status: '412' }] });
      });
      it('should redirect to start or resume', async function() {
        await route.model();

        sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume', 'NEW_CODE');
      });
    });

    context('when participation exists', function() {
      beforeEach(function() {
        storeStub.queryRecord.withArgs('campaignParticipationResult', { campaignId: campaign.id, userId: user.id }).resolves(campaign);
      });

      it('should not redirect', async function() {
        await route.model();

        sinon.assert.notCalled(route.transitionTo);
      });
    });
  });
});
