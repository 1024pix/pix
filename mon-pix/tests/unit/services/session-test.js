import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { DEFAULT_LOCALE, FRENCH_FRANCE_LOCALE, FRENCH_INTERNATIONAL_LOCALE } from 'mon-pix/services/locale';
import { SessionStorageEntry } from 'mon-pix/utils/session-storage-entry.js';
import { module, test } from 'qunit';
import sinon from 'sinon';

const FRANCE_TLD = 'fr';
const INTERNATIONAL_TLD = 'org';

module('Unit | Services | session', function (hooks) {
  setupTest(hooks);

  let sessionService;
  let routerService;
  let oauthAuthenticator;

  hooks.beforeEach(function () {
    sessionService = this.owner.lookup('service:session');
    sessionService.currentUser = { load: sinon.stub(), loadAttestationDetails: sinon.stub(), user: null };
    sessionService.currentDomain = { getExtension: sinon.stub() };
    sessionService.locale = {
      setLocaleCookie: sinon.stub(),
      hasLocaleCookie: sinon.stub(),
      handleUnsupportedLanguage: sinon.stub(),
      setLocale: sinon.stub(),
    };
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
      sessionService.currentDomain.getExtension.returns(FRANCE_TLD);

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
      sessionService.currentDomain.getExtension.returns(FRANCE_TLD);
      sessionService.userIdForLearnerAssociation = 1;

      // when
      await sessionService.authenticateUser('user', 'secret');

      // then
      assert.notOk(sessionService.userIdForLearnerAssociation);
    });

    test('should delete externalUserTokenFromGar', async function (assert) {
      // given
      sessionService.currentDomain.getExtension.returns(FRANCE_TLD);
      sessionService.externalUserTokenFromGar = 1;

      // when
      await sessionService.authenticateUser('user', 'secret');

      // then
      assert.notOk(sessionService.externalUserTokenFromGar);
    });
  });

  module('#handleAuthentication', function (hooks) {
    hooks.beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        shouldCloseSession: false,
        source: 'oidc-externe',
      };

      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    module('when current URL domain extension is .fr', function () {
      test('should load current user and set locale to fr', async function (assert) {
        // given
        sessionService.currentDomain.getExtension.returns(FRANCE_TLD);

        // when
        await sessionService.handleAuthentication();

        // then
        sinon.assert.calledOnce(sessionService.currentUser.load);
        sinon.assert.calledOnce(sessionService.currentUser.loadAttestationDetails);
        sinon.assert.calledWith(sessionService.locale.setLocale, DEFAULT_LOCALE);
        assert.ok(true);
      });
    });

    module('when current URL domain extension is .org', function () {
      test('should load current user and set locale to fr', async function (assert) {
        // given
        sessionService.currentDomain.getExtension.returns(INTERNATIONAL_TLD);

        // when
        await sessionService.handleAuthentication();

        // then
        sinon.assert.calledOnce(sessionService.currentUser.load);
        sinon.assert.calledWith(sessionService.locale.setLocale, DEFAULT_LOCALE);
        assert.ok(true);
      });

      test('should load current user and set locale to user language', async function (assert) {
        // given
        sessionService.currentDomain.getExtension.returns(INTERNATIONAL_TLD);
        sessionService.currentUser.user = { lang: 'nl' };

        // when
        await sessionService.handleAuthentication();

        // then
        sinon.assert.calledOnce(sessionService.currentUser.load);
        sinon.assert.calledWith(sessionService.locale.setLocale, 'nl');
        assert.ok(true);
      });
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

  module('#handleUserLanguageAndLocale', function () {
    module('when the current domain  is "fr"', function () {
      module('when there is no cookie locale', function () {
        test('add a cookie locale with "fr-FR" as value', async function (assert) {
          // given
          sessionService.locale.hasLocaleCookie.returns(false);
          sessionService.currentDomain.getExtension.returns(FRANCE_TLD);

          // when
          await sessionService.handleUserLanguageAndLocale();

          // then
          sinon.assert.calledWith(sessionService.locale.setLocaleCookie, FRENCH_FRANCE_LOCALE);
          assert.ok(true);
        });
      });

      module('when there is a cookie locale', function () {
        test('does not update cookie locale', async function (assert) {
          // given
          sessionService.locale.hasLocaleCookie.returns(true);
          sessionService.currentDomain.getExtension.returns(FRANCE_TLD);

          // when
          await sessionService.handleUserLanguageAndLocale();

          // then
          sinon.assert.notCalled(sessionService.locale.setLocaleCookie);
          assert.ok(true);
        });
      });
    });

    module('when the language is specified in the query parameters', function () {
      module('when the current domain extension is "org"', function () {
        module('when no user is loaded', function () {
          test('should set the current language with the value from the query parameter', async function (assert) {
            // given
            const transition = { to: { queryParams: { lang: 'de' } } };
            sessionService.locale.handleUnsupportedLanguage.returns('de');
            sessionService.currentDomain.getExtension.returns(INTERNATIONAL_TLD);

            // when
            await sessionService.handleUserLanguageAndLocale(transition);

            // then
            sinon.assert.calledWith(sessionService.locale.setLocale, 'de');
            assert.ok(true);
          });
        });

        module('when user is loaded', function () {
          module('when there is no error', function () {
            test('sets the current language with the value from the query parameter', async function (assert) {
              // given
              const transition = { to: { queryParams: { lang: 'de' } } };
              sessionService.locale.handleUnsupportedLanguage.returns('de');
              sessionService.currentDomain.getExtension.returns(INTERNATIONAL_TLD);
              sessionService.currentUser.user = { lang: FRENCH_INTERNATIONAL_LOCALE };

              // when
              await sessionService.handleUserLanguageAndLocale(transition);

              // then
              sinon.assert.calledWith(sessionService.locale.setLocale, 'de');
              assert.ok(true);
            });
          });
        });
      });
    });

    module('when the language is not specified in the query parameters', function () {
      module('when the current domain extension is "org"', function () {
        module('when no user is loaded', function () {
          test('should set the current language with the default locale value', async function (assert) {
            // given
            sessionService.currentDomain.getExtension.returns(INTERNATIONAL_TLD);

            // when
            await sessionService.handleUserLanguageAndLocale();

            // then
            sinon.assert.calledWith(sessionService.locale.setLocale, DEFAULT_LOCALE);
            assert.ok(true);
          });
        });

        module('when user is loaded', function () {
          test('should set the current language with the user language value', async function (assert) {
            // given
            sessionService.currentDomain.getExtension.returns(INTERNATIONAL_TLD);
            sessionService.currentUser.user = { lang: 'ru' };

            // when
            await sessionService.handleUserLanguageAndLocale();

            // then
            sinon.assert.calledWith(sessionService.locale.setLocale, 'ru');
            assert.ok(true);
          });
        });
      });
    });
  });

  module('#requireAuthenticationAndApprovedTermsOfService', function () {
    module('when user is authenticated and must validate the terms of service', function () {
      test('should redirect user to terms of service page', async function (assert) {
        // given
        const transition = { from: 'campaigns.campaign-landing-page' };
        sessionService.setup();
        sessionService.session.isAuthenticated = true;
        sessionService.currentUser.user = { mustValidateTermsOfService: true };

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
