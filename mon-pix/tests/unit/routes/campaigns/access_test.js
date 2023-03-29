import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | Access', function (hooks) {
  setupTest(hooks);

  let route, campaign, sessionStub;

  hooks.beforeEach(function () {
    campaign = {
      code: 'NEW_CODE',
      isRestrictedByIdentityProvider: sinon.stub(),
    };
    sessionStub = {
      requireAuthenticationAndApprovedTermsOfService: sinon.stub(),
      setAttemptedTransition: sinon.stub(),
      data: { externalUser: null, authenticated: {} },
    };
    route = this.owner.lookup('route:campaigns.access');
    route.modelFor = sinon.stub().returns(campaign);
    route.campaignStorage = { get: sinon.stub() };

    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
    route.session = sessionStub;
    class OidcIdentityProvidersStub extends Service {
      list = [];
    }
    this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /access is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
      assert.ok(true);
    });

    test('should continue on access route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      //then
      sinon.assert.notCalled(route.router.replaceWith);
      assert.ok(true);
    });

    test('should override authentication route', async function (assert) {
      // when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      // then

      assert.strictEqual(route.authenticationRoute, 'inscription');
    });

    test('should call parent’s beforeModel and transition to authenticationRoute', async function (assert) {
      // when
      await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

      // then
      sinon.assert.calledWith(
        sessionStub.requireAuthenticationAndApprovedTermsOfService,
        { from: 'campaigns.campaign-landing-page' },
        'inscription'
      );
      assert.ok(true);
    });

    module('when campaign belongs to an oidc provider', function (hooks) {
      hooks.beforeEach(function () {
        const oidcPartner = {
          id: 'oidc-partner',
          code: 'OIDC_PARTNER',
        };
        class OidcIdentityProvidersStub extends Service {
          'oidc-partner' = oidcPartner;
          list = [oidcPartner];
        }
        this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      });

      module('and user is not connected with that provider', function () {
        test('should use provider route', async function (assert) {
          // given
          route.session.data.externalUser = 'some external user';
          campaign.isRestrictedByIdentityProvider.withArgs('OIDC_PARTNER').returns(true);

          // when
          await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

          // then
          sinon.assert.calledWith(route.router.replaceWith, 'authentication.login-oidc', 'oidc-partner');
          assert.ok(true);
        });
      });

      module('and user is connected with that provider', function () {
        test('should not use provider route', async function (assert) {
          // given
          route.session.data.externalUser = 'some external user';
          const OIDC_PARTNER = 'OIDC_PARTNER';
          route.session.data.authenticated.identityProviderCode = OIDC_PARTNER;
          campaign.isRestrictedByIdentityProvider.withArgs(OIDC_PARTNER).returns(true);

          // when
          await route.beforeModel({ from: 'campaigns.campaign-landing-page' });

          // then
          sinon.assert.neverCalledWith(route.router.replaceWith, 'authentication.login-oidc', 'oidc-partner');
          assert.ok(true);
        });
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
          assert.strictEqual(route.authenticationRoute, 'campaigns.join.student-sco');
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
        assert.strictEqual(route.authenticationRoute, 'campaigns.join.student-sco');
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
        assert.strictEqual(route.authenticationRoute, 'campaigns.join.sco-mediacentre');
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
        assert.strictEqual(route.authenticationRoute, 'campaigns.join.anonymous');
      });
    });
  });
});
