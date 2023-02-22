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
        assert.throws(
          () => {
            route.beforeModel({
              to: {
                queryParams: {
                  error: 'access_denied',
                  error_description: 'Access was denied.',
                },
              },
            });
          },
          Error,
          'access_denied: Access was denied.'
        );
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

      hooks.afterEach(function () {
        sinon.restore();
      });

      module('when identity provider is not supported', function () {
        test('should redirect the user to main login page', async function (assert) {
          // given
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.router = { replaceWith: sinon.stub() };

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'idp' } } });

          // then
          sinon.assert.calledWith(route.router.replaceWith, 'authentication.login');
          assert.ok(true);
        });
      });

      module('when attempting transition', function () {
        test('should store the intent url in session data nextUrl', async function (assert) {
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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(sessionStub.data.nextURL, '/campagnes/PIXOIDC01/acces');
        });

        test('should build the url from the intent name and contexts in session data nextUrl', async function (assert) {
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
          route.router.urlFor = sinon.stub();

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } } });

          // then
          sinon.assert.calledWith(route.router.urlFor, 'campaigns.access', 'PIXOIDC01');
          assert.ok(true);
        });
      });

      test('should clear previous session data, redirect user to identity provider login page and set state and nonce', async function (assert) {
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
        assert.deepEqual(sessionStub.data, { nextURL: '/campagnes/PIXOIDC01/acces', state, nonce });
        assert.ok(true);
      });
    });
  });

  module('#afterModel', function () {
    module('when user has no pix account', function () {
      test('should redirect to login or register oidc page', async function (assert) {
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
        assert.ok(true);
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
        sinon.assert.notCalled(route.router.replaceWith);
        assert.ok(true);
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
      await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });

      // then
      sinon.assert.calledWithMatch(authenticateStub, 'authenticator:oidc', {
        code: 'test',
        state: undefined,
      });
      assert.ok(authenticateStub.getCall(0).args[1].redirectUri.includes('connexion/oidc'));
      assert.deepEqual(sessionStub.data, { state: undefined, nonce: undefined });
    });

    test('should return values to be received by after model to validate CGUs', async function (assert) {
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
      assert.deepEqual(response, {
        shouldValidateCgu: true,
        authenticationKey: 'key',
        identityProviderSlug: 'oidc-partner',
        givenName: 'Mélusine',
        familyName: 'TITEGOUTTE',
      });
      assert.ok(true);
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/require-expect
    test('should throw error if CGUs are already validated and authenticate fails', async function (assert) {
      // given
      const authenticateStub = sinon.stub().rejects({ errors: [{ detail: 'there was an error' }] });
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
        assert.strictEqual(error.message, 'there was an error');
        assert.ok(true);
      }
    });

    module('when the identity provider does not provide all the user required information', function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('throws an error', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects({
          errors: [
            {
              status: '422',
              code: 'USER_INFO_MANDATORY_MISSING_FIELDS',
              title: 'Unprocessable entity',
              detail:
                "Un ou des champs obligatoires (Champs manquants : given_name}) n'ont pas été renvoyés par votre fournisseur d'identité OIDC partner.",
              meta: {
                shortCode: 'OIDC01',
              },
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

        try {
          // when
          await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });
        } catch (error) {
          // then
          assert.strictEqual(
            error.message,
            "Un ou des champs obligatoires (Champs manquants : given_name}) n'ont pas été renvoyés par votre fournisseur d'identité OIDC partner."
          );
        }
      });
    });
  });
});
