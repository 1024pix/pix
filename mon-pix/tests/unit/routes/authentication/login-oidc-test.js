import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { ApplicationError } from 'mon-pix/errors/application-error';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../helpers/setup-intl';

module('Unit | Route | login-oidc', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#beforeModel', function () {
    module('when receives error from identity provider', function () {
      test('throws an error', function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');

        // when & then
        assert.rejects(
          route.beforeModel({
            to: {
              queryParams: {
                error: 'access_denied',
                error_description: 'Access was denied.',
              },
            },
          }),
          ApplicationError,
          'access_denied: Access was denied.',
        );
      });
    });

    module('when no code is present in queryParams', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(window, 'fetch').resolves({
          json: sinon.stub().resolves({ redirectTarget: 'https://oidc/connexion' }),
        });
        const oidcPartner = {
          id: 'oidc-partner',
          slug: 'oidc-partner',
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
          route.router = { transitionTo: sinon.stub() };

          // when
          await route.beforeModel({ to: { queryParams: {}, params: { identity_provider_slug: 'idp' } } });

          // then
          sinon.assert.calledWith(route.router.transitionTo, 'authentication.login');
          assert.ok(true);
        });
      });

      module('when attempting transition', function () {
        module('when TransitionIntent is a URLTransitionIntent', function () {
          test('stores the intent url in session data nextUrl', async function (assert) {
            // given
            const sessionStub = Service.create({
              attemptedTransition: { intent: { url: '/organisations/PIXOIDC01/acces' } },
              authenticate: sinon.stub().resolves(),
              data: {},
            });
            const route = this.owner.lookup('route:authentication/login-oidc');
            route.set('session', sessionStub);
            sinon.stub(Location, 'assign');

            const transition = {
              to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } },
              abort: sinon.stub(),
            };

            // when
            await route.beforeModel(transition);

            // then
            assert.strictEqual(sessionStub.data.nextURL, '/organisations/PIXOIDC01/acces');
          });
        });

        module('when TransitionIntent is a NamedTransitionIntent (no URL)', function () {
          module('when there is at least one context', function () {
            test('builds a url from the intent name and contexts and stores it in session data nextUrl', async function (assert) {
              // given
              const authenticateStub = sinon.stub().resolves();
              const sessionStub = Service.create({
                attemptedTransition: { intent: { name: 'organizations.access', contexts: ['PIXOIDC01'] } },
                authenticate: authenticateStub,
                data: {},
              });
              const route = this.owner.lookup('route:authentication/login-oidc');
              route.set('session', sessionStub);
              sinon.stub(Location, 'assign');
              route.router.urlFor = sinon.stub();

              const transition = {
                to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } },
                abort: sinon.stub(),
              };

              // when
              await route.beforeModel(transition);

              // then
              sinon.assert.calledWith(route.router.urlFor, 'organizations.access', 'PIXOIDC01');
              assert.ok(true);
            });
          });

          module('when there is no context', function () {
            test('builds a url from the intent name and stores it in session data nextUrl', async function (assert) {
              // given
              const authenticateStub = sinon.stub().resolves();
              const sessionStub = Service.create({
                attemptedTransition: { intent: { name: 'organizations.access', contexts: [] } },
                authenticate: authenticateStub,
                data: {},
              });
              const route = this.owner.lookup('route:authentication/login-oidc');
              route.set('session', sessionStub);
              sinon.stub(Location, 'assign');
              route.router.urlFor = sinon.stub();

              const transition = {
                to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } },
                abort: sinon.stub(),
              };

              // when
              await route.beforeModel(transition);

              // then
              sinon.assert.calledWith(route.router.urlFor, 'organizations.access');
              assert.ok(true);
            });
          });
        });
      });

      test('clears previous session data and redirects user to identity provider login page', async function (assert) {
        // given
        const sessionStub = Service.create({
          attemptedTransition: { intent: { url: '/organisations/PIXOIDC01/acces' } },
          authenticate: sinon.stub().resolves(),
          data: { nextURL: '/previous-url' },
        });
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.set('session', sessionStub);
        sinon.stub(Location, 'assign');

        const transition = {
          to: { queryParams: {}, params: { identity_provider_slug: 'oidc-partner' } },
          abort: sinon.stub(),
        };

        // when
        await route.beforeModel(transition);

        // then
        assert.true(Location.assign.calledWithMatch('https://oidc/connexion'));
        assert.deepEqual(sessionStub.data, { nextURL: '/organisations/PIXOIDC01/acces' });
      });
    });
  });

  module('#model', function (hooks) {
    hooks.beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        slug: 'oidc-partner',
        code: 'OIDC_PARTNER',
      };

      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    test('authenticates the user with identity provider', async function (assert) {
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
      assert.deepEqual(sessionStub.data, {});
    });

    test('returns values to be received by afterModel to validate CGU', async function (assert) {
      // given
      const authenticateStub = sinon.stub().rejects({
        errors: [
          {
            code: 'SHOULD_VALIDATE_CGU',
            meta: { authenticationKey: 'key', userClaims: { firstName: 'Mélusine', lastName: 'TITEGOUTTE' } },
          },
        ],
      });
      const sessionStub = Service.create({
        authenticate: authenticateStub,
        data: {},
      });
      const route = this.owner.lookup('route:authentication/login-oidc');
      route.set('session', sessionStub);
      route.router = { transitionTo: sinon.stub() };

      // when
      const response = await route.model(
        { identity_provider_slug: 'oidc-partner' },
        { to: { queryParams: { code: 'test' } } },
      );

      // then
      sinon.assert.calledOnce(authenticateStub);
      assert.deepEqual(response, {
        identityProviderSlug: 'oidc-partner',
        shouldCreateUserAccount: true,
      });
      assert.ok(true);
    });

    module('when there is a MISSING_OIDC_STATE error', function () {
      test('it redirects to authentication.login page', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects({
          errors: [
            {
              code: 'MISSING_OIDC_STATE',
            },
          ],
        });
        const sessionStub = Service.create({
          authenticate: authenticateStub,
          data: {},
        });
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.set('session', sessionStub);
        route.router = { transitionTo: sinon.stub() };

        // when
        await route.model({ identity_provider_slug: 'oidc-partner' }, { to: { queryParams: { code: 'test' } } });

        // then
        sinon.assert.calledOnce(authenticateStub);
        sinon.assert.calledWith(route.router.transitionTo, 'authentication.login');
        assert.ok(true);
      });
    });

    module('when CGU are already validated and authenticate fails', function () {
      test('throws an error', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects({ errors: [{ detail: 'there was an error' }] });
        const sessionStub = Service.create({
          authenticate: authenticateStub,
          data: {},
        });
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.set('session', sessionStub);
        route.router = { transitionTo: sinon.stub() };

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
    });

    module('when the identity provider does not provide all the user required information', function () {
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
        route.router = { transitionTo: sinon.stub() };

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

  module('#redirect', function () {
    module('when shouldCreateUserAccount', function () {
      test('it redirects to login or register oidc page', async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.router = { transitionTo: sinon.stub() };
        const identityProviderSlug = 'super-idp-name';
        const shouldCreateUserAccount = true;
        const model = { identityProviderSlug, shouldCreateUserAccount };

        // when
        await route.redirect(model);

        // then
        (sinon.assert.calledWith(route.router.transitionTo, 'authentication.oidc-signup-or-login', {
          queryParams: {
            identityProviderSlug,
          },
        }),
          assert.ok(true));
      });
    });
    module('when not shouldCreateUserAccount', function () {
      test('it does not redirect to login or register oidc page', async function (assert) {
        // given
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.router = { transitionTo: sinon.stub() };
        const identityProviderSlug = 'super-idp-name';
        const shouldCreateUserAccount = false;
        const model = { identityProviderSlug, shouldCreateUserAccount };

        // when
        await route.redirect(model);

        // then
        sinon.assert.notCalled(route.router.transitionTo);
        assert.ok(true);
      });
    });
  });
});
