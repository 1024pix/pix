import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import * as fetch from 'fetch';

module('Unit | Route | login-oidc', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    module('when receives error from identity provider', function () {
      test('should throw an error', function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');

        // when & then
        assert.throws(() => {
          route.beforeModel({
            to: {
              queryParams: {
                error: 'access_denied',
                error_description: 'Access was denied.',
              },
            },
          });
        }, 'access_denied: Access was denied.');
      });
    });

    module('when no code exists in queryParams', function (hooks) {
      const state = 'a8a3344f-6d7c-469d-9f84-bdd791e04fdf';
      const nonce = '555c86fe-ed0a-4a80-80f3-45b1f7c2df8c';

      hooks.beforeEach(function () {
        sinon.stub(fetch, 'default').resolves({
          json: sinon.stub().resolves({
            redirectTarget: `https://oidc/connexion`,
            state,
            nonce,
          }),
        });
      });

      hooks.afterEach(function () {
        sinon.restore();
      });

      module('when identity provider is not supported', function () {
        test('should redirect the user to main login page', async function (assert) {
          // given
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.router = { replaceWith: sinon.stub() };

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'oidc' } } });

          // then
          assert.expect(0);
          sinon.assert.calledWith(route.router.replaceWith, 'authentication.login');
        });
      });

      module('when attempting transition', function () {
        test('should store the intent url in session data nextUrl', async function (assert) {
          // given
          const authenticateStub = sinon.stub().resolves();
          const sessionStub = Service.create({
            attemptedTransition: {
              intent: {
                url: '/campagnes/PIXEMPLOI/acces',
              },
            },
            authenticate: authenticateStub,
            data: {},
          });
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.set('session', sessionStub);
          route.location = { replace: sinon.stub() };

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'cnav' } } });

          // then
          assert.equal(sessionStub.data.nextURL, '/campagnes/PIXEMPLOI/acces');
        });

        test('should build the url from the intent name and contexts in session data nextUrl', async function (assert) {
          // given
          const authenticateStub = sinon.stub().resolves();
          const sessionStub = Service.create({
            attemptedTransition: {
              intent: {
                name: 'campaigns.access',
                contexts: ['PIXEMPLOI'],
              },
            },
            authenticate: authenticateStub,
            data: {},
          });
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.set('session', sessionStub);
          route.location = { replace: sinon.stub() };

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'cnav' } } });

          // then
          assert.equal(sessionStub.data.nextURL, '/campagnes/PIXEMPLOI/acces');
        });
      });

      test('should direct user to identity provider login page and set state and nonce', async function (assert) {
        // given
        const authenticateStub = sinon.stub().resolves();
        const sessionStub = Service.create({
          attemptedTransition: {
            intent: {
              url: '/campagnes/PIXEMPLOI/acces',
            },
          },
          authenticate: authenticateStub,
          data: {},
        });
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.set('session', sessionStub);
        route.location = { replace: sinon.stub() };

        // when
        await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'cnav' } } });

        // then
        sinon.assert.calledWithMatch(route.location.replace, 'https://oidc/connexion');
        assert.deepEqual(sessionStub.data, { nextURL: '/campagnes/PIXEMPLOI/acces', state, nonce });
      });
    });
  });

  module('#afterModel', function () {
    module('when user has no pix account', function () {
      test("should redirect to cgu's oidc page", async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.router = { replaceWith: sinon.stub() };
        const identityProviderSlug = 'super-idp-name';

        // when
        await route.afterModel({ authenticationKey: '123', shouldValidateCgu: true, identityProviderSlug });

        // then
        assert.expect(0);
        sinon.assert.calledWith(route.router.replaceWith, 'terms-of-service-oidc', {
          queryParams: { authenticationKey: '123', identityProviderSlug },
        });
      });
    });

    module('when user has a pix account', function () {
      test("should not redirect to cgu's oidc page", async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.router = { replaceWith: sinon.stub() };
        const identityProviderSlug = 'super-idp-name';

        // when
        await route.afterModel({ authenticationKey: null, shouldValidateCgu: false, identityProviderSlug });

        // then
        assert.expect(0);
        sinon.assert.notCalled(route.router.replaceWith);
      });
    });
  });

  module('#model', function () {
    test('should request to authenticate user with identity provider', async function (assert) {
      // given
      const authenticateStub = sinon.stub().resolves();
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);

      // when
      await route.model({ identity_provider_slug: 'oidc' }, { to: { queryParams: { code: 'test' } } });

      // then
      sinon.assert.calledWithMatch(authenticateStub, 'authenticator:oidc', {
        code: 'test',
        state: undefined,
      });
      assert.equal(authenticateStub.getCall(0).args[1].redirectUri, 'connexion-oidc');
      assert.deepEqual(sessionStub.data, { state: undefined, nonce: undefined });
    });

    test('should return values to be received by after model to validate CGUs', async function (assert) {
      // given
      const authenticateStub = sinon
        .stub()
        .rejects({ errors: [{ code: 'SHOULD_VALIDATE_CGU', meta: { authenticationKey: 'key' } }] });
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);
      route.router = { replaceWith: sinon.stub() };

      // when
      const response = await route.model({ identity_provider_slug: 'oidc' }, { to: { queryParams: { code: 'test' } } });

      // then
      sinon.assert.calledOnce(authenticateStub);
      assert.deepEqual(response, {
        shouldValidateCgu: true,
        authenticationKey: 'key',
        identityProviderSlug: 'oidc',
      });
    });

    test('should throw error if CGUs are already validated and authenticate fails', async function (assert) {
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
        await route.model({ identity_provider_slug: 'oidc' }, { to: { queryParams: { code: 'test' } } });
      } catch (error) {
        // then
        sinon.assert.calledOnce(authenticateStub);
        assert.equal(error.message, '"there was an error"');
      }
    });
  });
});
