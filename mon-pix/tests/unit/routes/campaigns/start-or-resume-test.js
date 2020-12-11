import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Start-or-resume', function() {
  setupTest();

  let route;

  const campaign = {
    code: 'NEW_CODE',
    isRestricted: true,
  };

  beforeEach(function() {
    route = this.owner.lookup('route:campaigns.start-or-resume');
  });

  describe('#beforeModel', function() {
    it('should reset state', async function() {
      // given
      route.state.campaignCode = 'OLD_CODE';
      route.state.hasUserCompletedRestrictedCampaignAssociation = true;
      const transition = { to: { queryParams: { } } };
      route.modelFor = sinon.stub().returns(campaign);
      route.session = { isAuthenticated: true };
      route.currentUser = { user: { mustValidateTermsOfService: false } };
      route.replaceWith = sinon.stub();

      // when
      await route.beforeModel(transition);

      // then
      expect(route.state.hasUserCompletedRestrictedCampaignAssociation).to.be.false;
    });
  });
});
