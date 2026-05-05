import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService, stubSessionService } from '../../../helpers/service-stubs.js';

module('Unit | Route | Access', function (hooks) {
  setupTest(hooks);

  let route, organization;

  hooks.beforeEach(function () {
    organization = {
      verifiedCode: {
        id: 'CAMPAIGN_CODE',
        type: 'campaign',
        campaign: { isSimplifiedAccess: false },
      },
      organizationToJoin: {
        id: 1,
      },
    };
    route = this.owner.lookup('route:organizations.access');
    route.modelFor = sinon.stub().returns(organization);
    route.accessStorage = { hasUserSeenJoinPage: sinon.stub() };
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };

    stubOidcIdentityProvidersService(this.owner);
  });

  module('#beforeModel', function () {
    module('when user is authenticated from Pix', function (hooks) {
      let sessionStub;

      hooks.beforeEach(function () {
        sessionStub = stubSessionService(this.owner, { isAuthenticated: true });
        route.session = sessionStub;
      });

      test('should override authentication route', async function (assert) {
        // when
        await route.beforeModel();

        // then

        assert.strictEqual(route.authenticationRoute, 'inscription');
      });

      test("should call parent's beforeModel and transition to authenticationRoute", async function (assert) {
        // when
        const transition = { from: null };
        await route.beforeModel(transition);

        // then
        sinon.assert.calledWith(sessionStub.requireAuthenticationAndApprovedTermsOfService, transition, 'inscription');
        assert.ok(true);
      });

      module('when campaign belongs to an oidc provider', function (hooks) {
        hooks.beforeEach(function () {
          stubOidcIdentityProvidersService(this.owner, {
            oidcIdentityProviders: [
              {
                id: 'OIDC_PARTNER',
                code: 'OIDC_PARTNER',
                slug: 'oidc-partner',
                organizationName: 'OIDC Partner',
              },
              {
                id: 'OIDC_PARTNER_DIFFERENT',
                code: 'OIDC_PARTNER_DIFFERENT',
                slug: 'oidc-partner-different',
                organizationName: 'OIDC Partner Different',
              },
            ],
          });

          organization.organizationToJoin.identityProvider = 'OIDC_PARTNER';
        });

        module('and user is not connected with that provider', function () {
          test('should use provider route', async function (assert) {
            // given
            route.session.data.authenticated.identityProviderCode = 'OIDC_PARTNER_DIFFERENT';

            // when
            await route.beforeModel();

            // then
            sinon.assert.calledWith(route.router.replaceWith, 'authentication.login-oidc', 'oidc-partner');
            assert.ok(true);
          });
        });

        module('and user is connected with that provider', function () {
          test('should not use provider route', async function (assert) {
            // given
            route.session.data.authenticated.identityProviderCode = 'OIDC_PARTNER';

            // when
            await route.beforeModel();

            // then
            sinon.assert.neverCalledWith(route.router.replaceWith, 'authentication.login-oidc', 'oidc-partner');
            assert.ok(true);
          });
        });
      });
    });

    module(
      'when campaign is SCO restricted and user is neither authenticated from Pix nor a user from an external platform',
      function (hooks) {
        let sessionStub;

        hooks.beforeEach(function () {
          sessionStub = stubSessionService(this.owner, { isAuthenticated: false });
          route.session = sessionStub;
          organization.organizationToJoin.isRestricted = true;
          organization.organizationToJoin.type = 'SCO';
        });

        test('should override authentication route with student-sco', async function (assert) {
          // given
          organization.organizationToJoin.hasReconciliationFields = false;

          // when
          await route.beforeModel();
          // then
          assert.strictEqual(route.authenticationRoute, 'organizations.join.student-sco');
        });

        test('should not override authentication route when campaign reconciliationRequired', async function (assert) {
          // given
          organization.organizationToJoin.hasReconciliationFields = true;

          // when
          await route.beforeModel();

          // then
          assert.strictEqual(route.authenticationRoute, 'inscription');
        });
      },
    );

    module('when campaign is SCO restricted and user has been disconnected from sco form', function () {
      test('should override authentication route with student-sco', async function (assert) {
        // given
        const sessionStub = stubSessionService(this.owner, { isAuthenticated: false, isAuthenticatedByGar: true });
        route.session = sessionStub;
        organization.organizationToJoin.isRestricted = true;
        organization.organizationToJoin.type = 'SCO';
        route.accessStorage.hasUserSeenJoinPage.withArgs(organization.organizationToJoin.id).returns(true);

        // when
        await route.beforeModel();

        // then
        assert.strictEqual(route.authenticationRoute, 'organizations.join.student-sco');
      });
    });

    module('when campaign is restricted and user is from an external platform', function () {
      test('should override authentication route with sco-mediacentre', async function (assert) {
        // given
        const sessionStub = stubSessionService(this.owner, { isAuthenticated: false, isAuthenticatedByGar: true });
        route.session = sessionStub;
        organization.organizationToJoin.isRestricted = true;

        // when
        await route.beforeModel();

        // then
        assert.strictEqual(route.authenticationRoute, 'organizations.join.sco-mediacentre');
      });
    });

    module('when campaign is simplified access and user is not authenticated', function () {
      test('should override authentication route with anonymous', async function (assert) {
        // given
        const sessionStub = stubSessionService(this.owner, { isAuthenticated: false });
        route.session = sessionStub;
        organization.verifiedCode.campaign.isSimplifiedAccess = true;
        route.session.isAuthenticated = false;

        // when
        await route.beforeModel();

        // then
        assert.strictEqual(route.authenticationRoute, 'organizations.join.anonymous');
      });
    });
  });
});
