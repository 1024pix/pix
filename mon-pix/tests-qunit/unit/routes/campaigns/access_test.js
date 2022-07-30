import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Access', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    campaign = {
      code: 'NEW_CODE',
      isRestrictedByIdentityProvider: sinon.stub(),
    };
    route = this.owner.lookup('route:campaigns.access');
    route.modelFor = sinon.stub().returns(campaign);
    route.campaignStorage = { get: sinon.stub() };
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /access is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
    });

    test('should continue on access route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      //then
      assert.expect(0);
      sinon.assert.notCalled(route.router.replaceWith);
    });

    test('should override authentication route', async function (assert) {
      // when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      // then
      assert.equal(route.authenticationRoute, 'inscription');
    });

    test('should call parent’s beforeModel and transition to authenticationRoute', async function (assert) {
      // when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      // then
      assert.expect(0);
      sinon.assert.calledWith(route.router.transitionTo, 'inscription');
    });

    module('when campaign belongs to pole emploi and user is not connected with pole emploi', function () {
      test('should override authentication route with login-pole-emploi', async function (assert) {
        // given
        route.session.data.externalUser = 'some external user';
        campaign.isRestrictedByIdentityProvider.withArgs('POLE_EMPLOI').returns(true);

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.expect(0);
        sinon.assert.calledWith(route.router.replaceWith, 'authentication.login-oidc', 'pole-emploi');
      });
    });

    module('when campaign belongs to pole emploi and user is connected with pole emploi', function () {
      test('should not override authentication route with login-pole-emploi', async function (assert) {
        // given
        route.session.data.externalUser = 'some external user';
        const POLE_EMPLOI = 'POLE_EMPLOI';
        route.session.data.authenticated.identity_provider_code = POLE_EMPLOI;
        campaign.isRestrictedByIdentityProvider.withArgs(POLE_EMPLOI).returns(true);

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.expect(0);
        sinon.assert.neverCalledWith(route.router.replaceWith, 'authentication.login-oidc', 'pole-emploi');
      });
    });

    module('when campaign belongs to cnav and user is not connected with cnav', function () {
      test('should override authentication route with login-cnav', async function (assert) {
        // given
        route.session.data.externalUser = 'some external user';
        campaign.isRestrictedByIdentityProvider.withArgs('CNAV').returns(true);

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.expect(0);
        sinon.assert.calledWith(route.router.replaceWith, 'authentication.login-oidc', 'cnav');
      });
    });

    module('when campaign belongs to cnav and user is connected with cnav', function () {
      test('should not override authentication route with login-cnav', async function (assert) {
        // given
        route.session.data.externalUser = 'some external user';
        const CNAV = 'CNAV';
        route.session.data.authenticated.identity_provider_code = CNAV;
        campaign.isRestrictedByIdentityProvider.withArgs(CNAV).returns(true);

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.expect(0);
        sinon.assert.neverCalledWith(route.router.replaceWith, 'authentication.login-oidc', 'cnav');
      });
    });

    module(
      'when campaign is SCO restricted and user is neither authenticated from Pix nor a user from an external platform',
      function () {
        test('should override authentication route with student-sco', async function (assert) {
          // given
          route.session.isAuthenticated = false;
          campaign.isRestricted = true;
          campaign.organizationType = 'SCO';
          route.session.data.externalUser = undefined;

          // when
          await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

          // then
          assert.equal(route.authenticationRoute, 'campaigns.join.student-sco');
        });
      }
    );

    module('when campaign is SCO restricted and user has been disconnected from sco form', function () {
      test('should override authentication route with student-sco', async function (assert) {
        // given
        route.session.isAuthenticated = false;
        campaign.isRestricted = true;
        campaign.organizationType = 'SCO';
        route.session.data.externalUser = 'some external user';
        route.campaignStorage.get.withArgs(campaign.code, 'hasUserSeenJoinPage').returns(true);

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.equal(route.authenticationRoute, 'campaigns.join.student-sco');
      });
    });

    module('when campaign is restricted and user is from an external platform', function () {
      test('should override authentication route with sco-mediacentre', async function (assert) {
        // given
        campaign.isRestricted = true;
        route.session.data.externalUser = 'some external user';

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.equal(route.authenticationRoute, 'campaigns.join.sco-mediacentre');
      });
    });

    module('when campaign is simplified access and user is not authenticated', function () {
      test('should override authentication route with anonymous', async function (assert) {
        // given
        campaign.isSimplifiedAccess = true;
        route.session.isAuthenticated = false;

        // when
        await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

        // then
        assert.equal(route.authenticationRoute, 'campaigns.join.anonymous');
      });
    });
  });
});
