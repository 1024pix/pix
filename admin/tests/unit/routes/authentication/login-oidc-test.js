import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import * as fetch from 'fetch';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | login-oidc', function (hooks) {
  setupTest(hooks);

  module('#beforeModel', function () {
    module('when no code exists in queryParams', function (hooks) {
      let fetchStub;

      hooks.beforeEach(function () {
        fetchStub = sinon.stub(fetch, 'default').resolves({
          json: sinon.stub().resolves({
            redirectTarget: `https://oidc.example.net/connexion`,
          }),
        });
        const oidcPartner = {
          id: 'oidc-partner',
          code: 'OIDC_PARTNER',
        };

        class OidcIdentityProvidersStub extends Service {
          list = [oidcPartner];
        }

        this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      });

      hooks.afterEach(function () {
        sinon.restore();
      });

      module('when identity provider is not supported', function () {
        test('redirects the user to main login page', async function (assert) {
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

      module('when identity provider is supported', function () {
        test('redirects the user to authorization url', async function (assert) {
          // given
          const route = this.owner.lookup('route:authentication/login-oidc');
          route.location.replace = sinon.stub();

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } } });

          // then
          sinon.assert.calledWith(
            fetchStub,
            'http://localhost:3000/api/oidc/authorization-url?identity_provider=OIDC_PARTNER&audience=admin',
          );
          sinon.assert.calledWith(route.location.replace, 'https://oidc.example.net/connexion');
          assert.ok(true);
        });
      });
    });
  });

  module('#afterModel', function () {
    module('when user has a pix account', function () {
      test('authenticates user with reconciliation', async function (assert) {
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
        });
        assert.ok(true);
      });
    });

    module('when user has no pix account', function () {
      test('redirects to login with userShouldCreateAnAccount queryParam', async function (assert) {
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
            userShouldCreateAnAccount: true,
          },
        });
        assert.ok(true);
      });
    });
  });

  module('#model', function () {
    test('requests to authenticate user with identity provider', async function (assert) {
      // given
      const authenticateStub = sinon.stub().resolves();
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });

      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);
      sinon.stub(route.oidcIdentityProviders, 'loadReadyIdentityProviders');
      route.oidcIdentityProviders.loadReadyIdentityProviders.resolves();

      // when
      await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });

      // then
      sinon.assert.calledWithMatch(authenticateStub, 'authenticator:oidc', {
        code: 'test',
        state: undefined,
      });
      assert.deepEqual(sessionStub.data, {});
    });

    test('returns values to be received by after model to validate CGUs', async function (assert) {
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
      sinon.stub(route.oidcIdentityProviders, 'loadReadyIdentityProviders');
      route.oidcIdentityProviders.loadReadyIdentityProviders.resolves();

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

    test('throws error if CGUs are already validated and authenticate fails', async function (assert) {
      // given
      assert.expect(2);
      const authenticateStub = sinon.stub().rejects({ errors: [{ detail: 'there was an error' }] });
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);
      route.router = { replaceWith: sinon.stub() };
      sinon.stub(route.oidcIdentityProviders, 'loadReadyIdentityProviders');
      route.oidcIdentityProviders.loadReadyIdentityProviders.resolves();

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
      test('throws an error', async function (assert) {
        // given
        assert.expect(1);
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
        sinon.stub(route.oidcIdentityProviders, 'loadReadyIdentityProviders');
        route.oidcIdentityProviders.loadReadyIdentityProviders.resolves();

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

    module('when user does not have rights to access to pix admin', function () {
      test('redirects to login page', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects({
          errors: [
            {
              status: '403',
              code: 'PIX_ADMIN_ACCESS_NOT_ALLOWED',
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
        sinon.stub(route.oidcIdentityProviders, 'loadReadyIdentityProviders');
        route.oidcIdentityProviders.loadReadyIdentityProviders.resolves();

        // when
        await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });

        // then
        sinon.assert.calledWith(route.router.replaceWith, 'login', {
          queryParams: {
            userShouldRequestAccess: true,
          },
        });
        assert.ok(true);
      });
    });
  });
});
