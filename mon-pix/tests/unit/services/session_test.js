import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';

describe('Unit | Services | session', function () {
  setupTest();

  let sessionService;
  let routerService;
  let oauthAuthenticator;

  beforeEach(function () {
    sessionService = this.owner.lookup('service:session');
    sessionService.currentUser = { load: sinon.stub() };
    sessionService.currentDomain = { getExtension: sinon.stub() };
    sessionService.intl = { setLocale: sinon.stub() };
    sessionService.moment = { setLocale: sinon.stub() };
    sessionService._getRouteAfterInvalidation = sinon.stub();
    sessionService._logoutUser = sinon.stub();

    routerService = this.owner.lookup('service:router');
    routerService.transitionTo = sinon.stub();
    routerService.replaceWith = sinon.stub();

    oauthAuthenticator = this.owner.lookup('authenticator:oauth2');
    oauthAuthenticator.authenticate = sinon.stub().resolves('ok');
  });

  describe('#handleAuthentication', function () {
    beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        hasLogoutUrl: false,
        source: 'oidc-externe',
      };
      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    context('when current URL domain extension is .fr', function () {
      it('should load current user and set locale to fr', async function () {
        // given
        sessionService.currentDomain.getExtension.returns('fr');

        // when
        await sessionService.handleAuthentication();

        // then
        sinon.assert.calledOnce(sessionService.currentUser.load);
        sinon.assert.calledWith(sessionService.intl.setLocale, ['fr', 'fr']);
        sinon.assert.calledWith(sessionService.moment.setLocale, 'fr');
      });
    });

    context('when current URL domain extension is .org', async function () {
      it('should load current user and set locale to fr', async function () {
        // given
        sessionService.currentDomain.getExtension.returns('org');

        // when
        await sessionService.handleAuthentication();

        // then
        sinon.assert.calledOnce(sessionService.currentUser.load);
        sinon.assert.calledWith(sessionService.intl.setLocale, ['fr', 'fr']);
        sinon.assert.calledWith(sessionService.moment.setLocale, 'fr');
      });

      it('should load current user and set locale to user language', async function () {
        // given
        sessionService.currentDomain.getExtension.returns('org');
        sessionService.currentUser.user = { lang: 'nl' };

        // when
        await sessionService.handleAuthentication();

        // then
        sinon.assert.calledOnce(sessionService.currentUser.load);
        sinon.assert.calledWith(sessionService.intl.setLocale, ['nl', 'fr']);
        sinon.assert.calledWith(sessionService.moment.setLocale, 'nl');
      });
    });

    it('should replace the URL with the one set before the identity provider authentication', async function () {
      // given
      sessionService.data = { nextURL: '/campagnes', authenticated: { identityProviderCode: 'OIDC_PARTNER' } };

      // when
      await sessionService.handleAuthentication();

      // then
      sinon.assert.calledOnce(routerService.replaceWith);
      sinon.assert.calledWith(routerService.replaceWith, '/campagnes');
    });

    it('should transition to user dashboard route after authentication', async function () {
      // given & when
      await sessionService.handleAuthentication();

      // then
      sinon.assert.calledOnce(routerService.transitionTo);
      sinon.assert.calledWith(routerService.transitionTo, 'authenticated.user-dashboard');
    });
  });

  describe('#handleInvalidation', function () {
    context('when skipping redirection after session invalidation', function () {
      it('should reset skipping redirection state and do nothing', async function () {
        // given
        sessionService.skipRedirectAfterSessionInvalidation = true;

        // when
        await sessionService.handleInvalidation();

        // then
        expect(sessionService.skipRedirectAfterSessionInvalidation).to.be.undefined;
        sinon.assert.notCalled(sessionService._getRouteAfterInvalidation);
      });
    });
  });

  describe('#handleUserLanguageAndLocale', function () {
    beforeEach(function () {
      sessionService._loadCurrentUserAndSetLocale = sinon.stub();
    });

    context('when a new external user is authenticated', function () {
      it('should invalidate the current session', async function () {
        // given
        const transition = { to: { queryParams: { externalUser: 'user' } } };

        // when
        await sessionService.handleUserLanguageAndLocale(transition);

        // then
        sinon.assert.calledOnce(sessionService._logoutUser);
      });
    });

    context('when an existing external user is authenticated', function () {
      it('should invalidate the current session and authenticate the existing external user', async function () {
        // given
        const transition = { to: { queryParams: { token: 'token' } } };

        // when
        await sessionService.handleUserLanguageAndLocale(transition);

        // then
        sinon.assert.calledOnce(sessionService._logoutUser);
        sinon.assert.calledOnce(oauthAuthenticator.authenticate);
        sinon.assert.calledWith(oauthAuthenticator.authenticate, { token: 'token' });
      });
    });

    context('when an anonymous user is authenticated', function () {
      let transition;

      beforeEach(function () {
        transition = { to: { queryParams: {} } };
        sessionService.data = { authenticated: { authenticator: 'authenticator:anonymous' } };
      });

      context('and access an unauthorized route', function () {
        it('should be redirect to campagnes page', async function () {
          // given
          transition.to.name = 'unknown.route';

          // when
          await sessionService.handleUserLanguageAndLocale(transition);

          // then
          sinon.assert.calledOnce(sessionService._logoutUser);
          sinon.assert.calledWith(routerService.replaceWith, '/campagnes');
        });
      });

      context('and access an authorized route', function () {
        it('should not be redirect to campagnes page', async function () {
          // given
          transition.to.name = 'assessments.checkpoint';

          // when
          await sessionService.handleUserLanguageAndLocale(transition);

          // then
          sinon.assert.notCalled(routerService.replaceWith);
        });
      });
    });
  });

  describe('#requireAuthenticationAndApprovedTermsOfService', function () {
    context('when user is authenticated and must validate the terms of service', function () {
      it('should redirect user to terms of service page', async function () {
        // given
        const transition = { from: 'campaigns.campaign-landing-page' };
        sessionService.isAuthenticated = true;
        sessionService.currentUser.user = { mustValidateTermsOfService: true };

        // when
        await sessionService.requireAuthenticationAndApprovedTermsOfService(transition);

        // then
        expect(sessionService.attemptedTransition).to.deep.equal({ from: 'campaigns.campaign-landing-page' });
        sinon.assert.calledWith(routerService.transitionTo, 'terms-of-service');
      });
    });
  });

  describe('#setAttemptedTransition', function () {
    it('should set the property attemptedSession', function () {
      // given & when
      sessionService.setAttemptedTransition({ from: 'campaigns.campaign-landing-page' });

      // then
      expect(sessionService.attemptedTransition).to.deep.equal({ from: 'campaigns.campaign-landing-page' });
    });
  });
});
