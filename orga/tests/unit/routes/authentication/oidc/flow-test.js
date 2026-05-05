import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../../../helpers/service-stubs';
import setupIntl from '../../../../helpers/setup-intl';

module('Unit | Route | Authentication | OIDC | flow', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#model', function (hooks) {
    hooks.beforeEach(function () {
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

    module('when there is an unexpected error (not a JSON:API error)', function () {
      test('it throws back the error', async function (assert) {
        // given
        const authenticateStub = sinon.stub().rejects(new Error('Internal Server Error, this is not a JSON:API error'));
        const sessionStub = Service.create({
          authenticate: authenticateStub,
          data: {},
        });
        const route = this.owner.lookup('route:authentication/oidc.flow');
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
        const route = this.owner.lookup('route:authentication/oidc.flow');
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
        const route = this.owner.lookup('route:authentication/oidc.flow');
        route.set('session', sessionStub);
        route.router = { transitionTo: sinon.stub() };

        await assert.rejects(
          route.model(
            { identity_provider_slug: 'oidc-partner' },
            { to: { queryParams: { code: 'test' } } },
            /Some error/,
          ),
        );
      });
    });
  });
});
