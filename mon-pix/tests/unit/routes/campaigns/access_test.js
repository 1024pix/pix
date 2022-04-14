import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Access', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    campaign = {
      code: 'NEW_CODE',
    };
    route = this.owner.lookup('route:campaigns.access');
    route.modelFor = sinon.stub().returns(campaign);
    route.campaignStorage = { get: sinon.stub() };
    route.router.transitionTo = sinon.stub();
    route.replaceWith = sinon.stub();
  });

  describe('#beforeModel', function () {
    it('should redirect to entry point when /acces is directly set in the url', async function () {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entry-point');
    });

    it('should continue on access route when from is set', async function () {
      //when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      //then
      sinon.assert.notCalled(route.replaceWith);
    });

    it('should override authentication route', async function () {
      // when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      // then
      expect(route.authenticationRoute).to.equal('inscription');
    });

    it('should call parent’s beforeModel and transition to authenticationRoute', async function () {
      // when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      // then
      sinon.assert.calledWith(route.router.transitionTo, 'inscription');
    });

    context('when campaign belongs to pole emploi and user is not connected with pole emploi', function () {
      it('should override authentication route with login-pole-emploi', async function () {
        // given
        route.session.data.externalUser = 'some external user';
        campaign.organizationIsPoleEmploi = true;

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        sinon.assert.calledWith(route.replaceWith, 'login-pole-emploi');
      });
    });

    context(
      'when campaign is SCO restricted and user is neither authenticated from Pix nor a user from an external platform',
      function () {
        it('should override authentication route with student-sco', async function () {
          // given
          route.session.isAuthenticated = false;
          campaign.isRestricted = true;
          campaign.organizationType = 'SCO';
          route.session.data.externalUser = undefined;

          // when
          await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

          // then
          expect(route.authenticationRoute).to.equal('campaigns.join.student-sco');
        });
      }
    );

    context('when campaign is SCO restricted and user has been disconnected from sco form', function () {
      it('should override authentication route with student-sco', async function () {
        // given
        route.session.isAuthenticated = false;
        campaign.isRestricted = true;
        campaign.organizationType = 'SCO';
        route.session.data.externalUser = 'some external user';
        route.campaignStorage.get.withArgs(campaign.code, 'hasUserSeenJoinPage').returns(true);

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        expect(route.authenticationRoute).to.equal('campaigns.join.student-sco');
      });
    });

    context('when campaign is restricted and user is from an external platform', function () {
      it('should override authentication route with sco-mediacentre', async function () {
        // given
        campaign.isRestricted = true;
        route.session.data.externalUser = 'some external user';

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        expect(route.authenticationRoute).to.equal('campaigns.join.sco-mediacentre');
      });
    });

    context('when campaign is simplified access and user is not authenticated', function () {
      it('should override authentication route with anonymous', async function () {
        // given
        campaign.isSimplifiedAccess = true;
        route.session.isAuthenticated = false;

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        expect(route.authenticationRoute).to.equal('campaigns.join.anonymous');
      });
    });
  });
});
