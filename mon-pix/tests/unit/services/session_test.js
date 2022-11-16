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
    sessionService.currentUser = { load: sinon.stub(), user: null };
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

  describe('#authenticateUser', function () {
    it('should authenticate the user with oauth2 and mon-pix scope', async function () {
      // given
      const expectedScope = 'mon-pix';
      const expectedLogin = 'user';
      const expectedPassword = 'secret';
      sessionService.currentDomain.getExtension.returns('fr');

      // when
      await sessionService.authenticateUser(expectedLogin, expectedPassword);

      // then
      sinon.assert.calledWith(oauthAuthenticator.authenticate, {
        login: expectedLogin,
        password: expectedPassword,
        scope: expectedScope,
      });
    });

    it('should delete expectedUserId', async function () {
      // given
      sessionService.currentDomain.getExtension.returns('fr');
      sessionService.data.expectedUserId = 1;

      // when
      await sessionService.authenticateUser('user', 'secret');

      // then
      expect(sessionService.data.expectedUserId).to.be.undefined;
    });

    it('should delete externalUser', async function () {
      // given
      sessionService.currentDomain.getExtension.returns('fr');
      sessionService.data.externalUser = 1;

      // when
      await sessionService.authenticateUser('user', 'secret');

      // then
      expect(sessionService.data.externalUser).to.be.undefined;
    });
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
    context('when the language is specified in the query parameters', function () {
      context('when the current domain extension is "org"', function () {
        context('when no user is loaded', function () {
          it('should set the current language with the value from the query parameter', async function () {
            // given
            const transition = { to: { queryParams: { lang: 'de' } } };
            sessionService.currentDomain.getExtension.returns('org');

            // when
            await sessionService.handleUserLanguageAndLocale(transition);

            // then
            sinon.assert.calledWith(sessionService.intl.setLocale, ['de', 'fr']);
            sinon.assert.calledWith(sessionService.moment.setLocale, 'de');
          });
        });

        context('when user is loaded', function () {
          context('when there is no error', function () {
            it('should set the current language with the value from the query parameter', async function () {
              // given
              const transition = { to: { queryParams: { lang: 'de' } } };
              sessionService.currentDomain.getExtension.returns('org');
              sessionService.currentUser.user = { lang: 'ru', save: sinon.stub() };

              // when
              await sessionService.handleUserLanguageAndLocale(transition);

              // then
              sinon.assert.calledWith(sessionService.currentUser.user.save, { adapterOptions: { lang: 'de' } });
              sinon.assert.calledWith(sessionService.intl.setLocale, ['de', 'fr']);
              sinon.assert.calledWith(sessionService.moment.setLocale, 'de');
              expect(sessionService.currentUser.user.lang).to.equal('de');
            });
          });

          context('when an error occurs', function () {
            context('with an HTTP status code 400', function () {
              it('should set the current language with the user language value', async function () {
                // given
                const transition = { to: { queryParams: { lang: 'de' } } };
                sessionService.currentDomain.getExtension.returns('org');
                sessionService.currentUser.user = {
                  lang: 'ru',
                  save: sinon.stub().throws({ errors: [{ status: '400' }] }),
                  rollbackAttributes: function () {
                    sessionService.currentUser.user.lang = 'ru';
                  },
                };

                // when
                await sessionService.handleUserLanguageAndLocale(transition);

                // then
                sinon.assert.calledWith(sessionService.currentUser.user.save, { adapterOptions: { lang: 'de' } });
                sinon.assert.calledWith(sessionService.intl.setLocale, ['ru', 'fr']);
                sinon.assert.calledWith(sessionService.moment.setLocale, 'ru');
              });
            });
          });
        });
      });
    });

    context('when the language is not specified in the query parameters', function () {
      context('when the current domain extension is "org"', function () {
        context('when no user is loaded', function () {
          it('should set the current language with the default locale value', async function () {
            // given
            sessionService.currentDomain.getExtension.returns('org');

            // when
            await sessionService.handleUserLanguageAndLocale();

            // then
            sinon.assert.calledWith(sessionService.intl.setLocale, ['fr', 'fr']);
            sinon.assert.calledWith(sessionService.moment.setLocale, 'fr');
          });
        });

        context('when user is loaded', function () {
          it('should set the current language with the user language value', async function () {
            // given
            sessionService.currentDomain.getExtension.returns('org');
            sessionService.currentUser.user = { lang: 'ru' };

            // when
            await sessionService.handleUserLanguageAndLocale();

            // then
            sinon.assert.calledWith(sessionService.intl.setLocale, ['ru', 'fr']);
            sinon.assert.calledWith(sessionService.moment.setLocale, 'ru');
          });
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
