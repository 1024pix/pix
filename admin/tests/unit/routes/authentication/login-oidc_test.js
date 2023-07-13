import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import * as fetch from 'fetch';

module('Unit | Route | login-oidc', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
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
          sinon.assert.calledWith(route.router.replaceWith, 'login');
          assert.ok(true);
        });
      });
    });
  });

  module('#afterModel', function () {
    module('when user has a pix account', function () {
      test('should authenticate user with reconciliation', async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        const authenticateStub = sinon.stub().resolves();
        const sessionStub = Service.create({
          authenticate: authenticateStub,
        });
        route.set('session', sessionStub);

        // when
        await route.afterModel({
          authenticationKey: '123',
          identityProviderSlug: 'super-idp-name',
          email: 'john@example.net',
        });

        // then
        sinon.assert.calledWith(route.session.authenticate, 'authenticator:oidc', {
          authenticationKey: '123',
          identityProviderSlug: 'super-idp-name',
          email: 'john@example.net',
          hostSlug: 'user/reconcile',
        });
        assert.ok(true);
      });
    });

    module('when user has no pix account', function () {
      test('should redirect to login with isUserShouldCreateAnAccount queryParam', async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        const errors = {
          errors: [{ status: '404', code: 'USER_ACCOUNT_NOT_FOUND' }],
        };
        route.router = { replaceWith: sinon.stub() };
        const authenticateStub = sinon.stub().rejects(errors);
        const sessionStub = Service.create({
          authenticate: authenticateStub,
        });
        route.set('session', sessionStub);

        // when
        await route.afterModel({
          authenticationKey: '123',
          identityProviderSlug: 'super-idp-name',
          email: 'john@example.net',
        });

        // then
        sinon.assert.calledWith(route.router.replaceWith, 'login', {
          queryParams: {
            isUserShouldCreateAnAccount: true,
          },
        });
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
            meta: {
              authenticationKey: 'key',
              givenName: 'Mélusine',
              familyName: 'TITEGOUTTE',
              email: 'melu@example.net',
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

      // when
      const response = await route.model(
        { identity_provider_slug: 'oidc-partner' },
        { to: { queryParams: { code: 'test' } } },
      );

      // then
      sinon.assert.calledOnce(authenticateStub);
      assert.deepEqual(response, {
        shouldUserCreateAnAccount: true,
        authenticationKey: 'key',
        email: 'melu@example.net',
        identityProviderSlug: 'oidc-partner',
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
            "Un ou des champs obligatoires (Champs manquants : given_name}) n'ont pas été renvoyés par votre fournisseur d'identité OIDC partner.",
          );
        }
      });
    });
  });
});
