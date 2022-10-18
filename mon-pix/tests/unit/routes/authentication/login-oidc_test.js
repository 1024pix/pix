import { expect } from 'chai';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import * as fetch from 'fetch';

describe('Unit | Route | login-oidc', function () {
  setupTest();

  describe('#beforeModel', function () {
    context('when receives error from identity provider', function () {
      it('should throw an error', function () {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');

        // when & then
        expect(() => {
          route.beforeModel({
            to: {
              queryParams: {
                error: 'access_denied',
                error_description: 'Access was denied.',
              },
            },
          });
        }).to.throw(Error, 'access_denied: Access was denied.');
      });
    });

    context('when no code exists in queryParams', function () {
      const state = 'a8a3344f-6d7c-469d-9f84-bdd791e04fdf';
      const nonce = '555c86fe-ed0a-4a80-80f3-45b1f7c2df8c';

      beforeEach(function () {
        sinon.stub(fetch, 'default').resolves({
          json: sinon.stub().resolves({
            redirectTarget: `https://oidc/connexion`,
            state,
            nonce,
          }),
        });
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

      afterEach(function () {
        sinon.restore();
      });

      context('when identity provider is not supported', function () {
        it('should redirect the user to main login page', async function () {
          // given
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.router = { replaceWith: sinon.stub() };

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'idp' } } });

          // then
          sinon.assert.calledWith(route.router.replaceWith, 'authentication.login');
        });
      });

      context('when attempting transition', function () {
        it('should store the intent url in session data nextUrl', async function () {
          // given
          const sessionStub = Service.create({
            attemptedTransition: { intent: { url: '/campagnes/PIXOIDC01/acces' } },
            authenticate: sinon.stub().resolves(),
            data: {},
          });
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.set('session', sessionStub);
          route.location.replace = sinon.stub();

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } } });

          // then
          expect(sessionStub.data.nextURL).to.equal('/campagnes/PIXOIDC01/acces');
        });

        it('should build the url from the intent name and contexts in session data nextUrl', async function () {
          // given
          const authenticateStub = sinon.stub().resolves();
          const sessionStub = Service.create({
            attemptedTransition: { intent: { name: 'campaigns.access', contexts: ['PIXOIDC01'] } },
            authenticate: authenticateStub,
            data: {},
          });
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.set('session', sessionStub);
          route.location.replace = sinon.stub();

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } } });

          // then
          expect(sessionStub.data.nextURL).to.equal('/campagnes/PIXOIDC01/acces');
        });
      });

      it('should clear previous session data, redirect user to identity provider login page and set state and nonce', async function () {
        // given
        const sessionStub = Service.create({
          attemptedTransition: { intent: { url: '/campagnes/PIXOIDC01/acces' } },
          authenticate: sinon.stub().resolves(),
          data: {
            nextURL: '/previous-url',
            state: 'previous-state',
            nonce: 'previous-nonce',
          },
        });
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.set('session', sessionStub);
        route.location.replace = sinon.stub();

        // when
        await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } } });

        // then
        sinon.assert.calledWithMatch(route.location.replace, 'https://oidc/connexion');
        expect(sessionStub.data).to.deep.equal({ nextURL: '/campagnes/PIXOIDC01/acces', state, nonce });
      });
    });
  });

  describe('#afterModel', function () {
    describe('when user has no pix account', function () {
      it('should redirect to login or register oidc page', async function () {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.router = { replaceWith: sinon.stub() };
        const identityProviderSlug = 'super-idp-name';

        // when
        await route.afterModel({ authenticationKey: '123', shouldValidateCgu: true, identityProviderSlug });

        // then
        sinon.assert.calledWith(route.router.replaceWith, 'authentication.login-or-register-oidc', {
          queryParams: {
            authenticationKey: '123',
            identityProviderSlug,
            givenName: undefined,
            familyName: undefined,
          },
        });
      });
    });

    describe('when user has a pix account', function () {
      it("should not redirect to cgu's oidc page", async function () {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.router = { replaceWith: sinon.stub() };
        const identityProviderSlug = 'super-idp-name';

        // when
        await route.afterModel({ authenticationKey: null, shouldValidateCgu: false, identityProviderSlug });

        // then
        sinon.assert.notCalled(route.router.replaceWith);
      });
    });
  });

  describe('#model', function () {
    it('should request to authenticate user with identity provider', async function () {
      // given
      const authenticateStub = sinon.stub().resolves();
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);

      // when
      await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });

      // then
      sinon.assert.calledWithMatch(authenticateStub, 'authenticator:oidc', {
        code: 'test',
        state: undefined,
      });
      expect(authenticateStub.getCall(0).args[1].redirectUri).to.contain('connexion/oidc');
      expect(sessionStub.data).to.deep.equal({ state: undefined, nonce: undefined });
    });

    it('should return values to be received by after model to validate CGUs', async function () {
      // given
      const authenticateStub = sinon.stub().rejects({
        errors: [
          {
            code: 'SHOULD_VALIDATE_CGU',
            meta: { authenticationKey: 'key', givenName: 'Mélusine', familyName: 'TITEGOUTTE' },
          },
        ],
      });
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);
      route.router = { replaceWith: sinon.stub() };

      // when
      const response = await route.model(
        { identity_provider_slug: 'oidc-partner' },
        { to: { queryParams: { code: 'test' } } }
      );

      // then
      sinon.assert.calledOnce(authenticateStub);
      expect(response).to.deep.equal({
        shouldValidateCgu: true,
        authenticationKey: 'key',
        identityProviderSlug: 'oidc-partner',
        givenName: 'Mélusine',
        familyName: 'TITEGOUTTE',
      });
    });

    it('should throw error if CGUs are already validated and authenticate fails', async function () {
      // given
      const authenticateStub = sinon.stub().rejects({ errors: 'there was an error' });
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);
      route.router = { replaceWith: sinon.stub() };

      try {
        // when
        await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });
      } catch (error) {
        // then
        sinon.assert.calledOnce(authenticateStub);
        expect(error.message).to.equal('"there was an error"');
      }
    });
  });
});
