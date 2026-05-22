import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { ApplicationError } from 'mon-pix/errors/application-error';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../../helpers/service-stubs';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Route | login-oidc', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#beforeModel', function () {
    module('when receives error from identity provider', function () {
      test('it throws an error', function (assert) {
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
          status: 200,
          json: sinon.stub().resolves({ redirectTarget: 'https://oidc/connexion' }),
        });

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

      module('when identity provider is not supported', function () {
        test('it redirects the user to main login page', async function (assert) {
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
          test('it stores the intent url in session data nextUrl', async function (assert) {
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
            test('it builds a url from the intent name and contexts and stores it in session data nextUrl', async function (assert) {
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
            test('it builds a url from the intent name and stores it in session data nextUrl', async function (assert) {
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
        id: 'OIDC_PARTNER',
        code: 'OIDC_PARTNER',
        slug: 'oidc-partner',
      };
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      const storeStub = Service.create({
        findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
        peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
      });
      oidcIdentityProvidersService.set('store', storeStub);
    });

    module('when there is an unexpected error (not a JSON:API error)', function () {
      test('it throws back the error', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects(new Error('Internal Server Error, this is not a JSON:API error'));
        const sessionStub = Service.create({
          authenticate: authenticateStub,
          data: {},
        });
        const route = this.owner.lookup('route:authentication/login-oidc');
        route.set('session', sessionStub);
        route.router = { transitionTo: sinon.stub() };

        // when & then
        await assert.rejects(
          route.model(
            { identity_provider_slug: 'oidc-partner' },
            { to: { queryParams: { code: 'test' } } },
            /Internal Server Error, this is not a JSON:API error/,
          ),
        );
      });
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

    module('when CGU are already validated but authenticate fails', function () {
      test('it throws an error', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects({ errors: [{ detail: 'Some error' }] });
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
          assert.strictEqual(error.message, 'Some error');
          assert.ok(true);
        }
      });
    });
  });
});
