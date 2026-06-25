import { setupTest } from 'ember-qunit';
import { SessionStorageEntry } from 'mon-pix/utils/session-storage-entry.js';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../helpers/service-stubs.js';

module('Unit | Services | session', function (hooks) {
  setupTest(hooks);

  let sessionService;
  let routerService;
  let oauthAuthenticator;

  hooks.beforeEach(function () {
    sessionService = this.owner.lookup('service:session');
    sessionService.currentUser = { load: sinon.stub(), user: null };
    sessionService._getRouteAfterInvalidation = sinon.stub();

    routerService = this.owner.lookup('service:router');
    routerService.transitionTo = sinon.stub();
    routerService.replaceWith = sinon.stub();

    oauthAuthenticator = this.owner.lookup('authenticator:oauth2');
    oauthAuthenticator.authenticate = sinon.stub().resolves('ok');
  });

  module('#authenticateUser', function () {
    test('should authenticate the user with oauth2', async function (assert) {
      // given
      const expectedLogin = 'user';
      const expectedPassword = 'secret';

      // when
      await sessionService.authenticateUser(expectedLogin, expectedPassword);

      // then
      sinon.assert.calledWith(oauthAuthenticator.authenticate, {
        login: expectedLogin,
        password: expectedPassword,
      });
      assert.ok(true);
    });

    test('should delete userIdForLearnerAssociation', async function (assert) {
      // given
      sessionService.userIdForLearnerAssociation = 1;

      // when
      await sessionService.authenticateUser('user', 'secret');

      // then
      assert.notOk(sessionService.userIdForLearnerAssociation);
    });

    test('should delete externalUserTokenFromGar', async function (assert) {
      // given
      sessionService.externalUserTokenFromGar = 1;

      // when
      await sessionService.authenticateUser('user', 'secret');

      // then
      assert.notOk(sessionService.externalUserTokenFromGar);
    });
  });

  module('#handleAuthentication', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'OIDC_PARTNER',
            code: 'OIDC_PARTNER',
            slug: 'oidc-partner',
            organizationName: 'OIDC Partner',
          },
        ],
      });
    });

    test('loads current user', async function (assert) {
      // given // when
      await sessionService.handleAuthentication();

      // then
      sinon.assert.calledOnce(sessionService.currentUser.load);
      assert.ok(true);
    });

    test('should replace the URL with the one set before the identity provider authentication', async function (assert) {
      // given
      sessionService.data.nextURL = '/campagnes';
      sessionService.data.authenticated = { identityProviderCode: 'OIDC_PARTNER' };

      // when
      await sessionService.handleAuthentication();

      // then
      sinon.assert.calledOnce(routerService.replaceWith);
      sinon.assert.calledWith(routerService.replaceWith, '/campagnes');
      assert.ok(true);
    });

    test('should transition to user dashboard route after authentication', async function (assert) {
      // given & when
      await sessionService.handleAuthentication();

      // then
      sinon.assert.calledOnce(routerService.transitionTo);
      sinon.assert.calledWith(routerService.transitionTo, 'authenticated.user-dashboard');
      assert.ok(true);
    });
  });

  module('#handleInvalidation', function () {
    module('when skipping redirection after session invalidation', function () {
      test('should reset skipping redirection state and do nothing', async function (assert) {
        // given
        sessionService.skipRedirectAfterSessionInvalidation = true;

        // when
        await sessionService.handleInvalidation();

        // then
        assert.notOk(sessionService.skipRedirectAfterSessionInvalidation);
        sinon.assert.notCalled(sessionService._getRouteAfterInvalidation);
        assert.ok(true);
      });
    });
  });

  module('#requireAuthenticationAndApprovedTermsOfService', function () {
    module('when user is authenticated and has terms of service status set at Requested', function () {
      test('should redirect user to terms of service page', async function (assert) {
        // given
        const transition = { from: 'campaigns.campaign-landing-page' };
        sessionService.setup();
        sessionService.session.isAuthenticated = true;
        sessionService.currentUser.user = { pixAppTermsOfServiceStatus: 'requested' };

        // when
        await sessionService.requireAuthenticationAndApprovedTermsOfService(transition);

        // then
        assert.deepEqual(sessionService.attemptedTransition, { from: 'campaigns.campaign-landing-page' });
        sinon.assert.calledWith(routerService.transitionTo, 'terms-of-service');
        assert.ok(true);
      });
    });

    module('when user is authenticated and has terms of service status set at Update Requested', function () {
      test('should redirect user to terms of service page', async function (assert) {
        // given
        const transition = { from: 'campaigns.campaign-landing-page' };
        sessionService.setup();
        sessionService.session.isAuthenticated = true;
        sessionService.currentUser.user = { pixAppTermsOfServiceStatus: 'update-requested' };

        // when
        await sessionService.requireAuthenticationAndApprovedTermsOfService(transition);

        // then
        assert.deepEqual(sessionService.attemptedTransition, { from: 'campaigns.campaign-landing-page' });
        sinon.assert.calledWith(routerService.transitionTo, 'terms-of-service');
        assert.ok(true);
      });
    });
  });

  module('#setAttemptedTransition', function () {
    test('should set the property attemptedSession', function (assert) {
      // given & when
      sessionService.setAttemptedTransition({ from: 'campaigns.campaign-landing-page' });

      // then
      assert.deepEqual(sessionService.attemptedTransition, { from: 'campaigns.campaign-landing-page' });
    });
  });

  module('#isAuthenticatedByGar', function () {
    test('returns true if the external user token from gar is set', function (assert) {
      // given
      sessionService.externalUserTokenFromGar = '134';

      // when
      const isAuthenticatedByGar = sessionService.isAuthenticatedByGar;

      // then
      assert.ok(isAuthenticatedByGar);
    });

    test('returns false if the external user token from gar not is set', function (assert) {
      // given
      sessionService.externalUserTokenFromGar = null;

      // when
      const isAuthenticatedByGar = sessionService.isAuthenticatedByGar;

      // then
      assert.notOk(isAuthenticatedByGar);
    });
  });

  module('#externalUserTokenFromGar', function () {
    test('gets the external user token from the session storage', function (assert) {
      // given
      const sessionStorage = new SessionStorageEntry('externalUserTokenFromGar');
      sessionStorage.set('XXX');

      // when
      const externalUserTokenFromGar = sessionService.externalUserTokenFromGar;

      // then
      assert.strictEqual(externalUserTokenFromGar, 'XXX');
    });

    test('sets the external user token to the session storage', function (assert) {
      // given
      sessionService.externalUserTokenFromGar = 'XXX';

      // when
      const sessionStorage = new SessionStorageEntry('externalUserTokenFromGar');

      // then
      assert.strictEqual(sessionStorage.get(), 'XXX');
    });
  });

  module('#userIdForLearnerAssociation', function () {
    test('gets the user id for learner association from the session storage', function (assert) {
      // given
      const sessionStorage = new SessionStorageEntry('userIdForLearnerAssociation');
      sessionStorage.set(123);

      // when
      const userIdForLearnerAssociation = sessionService.userIdForLearnerAssociation;

      // then
      assert.strictEqual(userIdForLearnerAssociation, 123);
    });

    test('sets the user id for learner association to the session storage', function (assert) {
      // given
      sessionService.userIdForLearnerAssociation = 123;

      // when
      const sessionStorage = new SessionStorageEntry('userIdForLearnerAssociation');

      // then
      assert.strictEqual(sessionStorage.get(), 123);
    });
  });

  module('#revokeGarExternalUserToken', function () {
    test('removes the external user token from the session storage', function (assert) {
      // given
      sessionService.externalUserTokenFromGar = 'XXX';

      // when
      sessionService.revokeGarExternalUserToken();

      // then
      assert.notOk(sessionService.externalUserTokenFromGar);
    });
  });

  module('#revokeGarAuthenticationContext', function () {
    test('removes the external user token from the session storage', function (assert) {
      // given
      sessionService.externalUserTokenFromGar = 'XXX';
      sessionService.userIdForLearnerAssociation = 123;

      // when
      sessionService.revokeGarAuthenticationContext();

      // then
      assert.notOk(sessionService.externalUserTokenFromGar);
      assert.notOk(sessionService.userIdForLearnerAssociation);
    });
  });
});
