import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import IdentityProvidersAuthentication from 'mon-pix/components/authentication/identity-providers-authentication';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | identity-providers-authentication', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are identity providers', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'some-identity-provider',
            slug: 'some-identity-provider',
            code: 'SOME_IDENTITY_PROVIDER',
            organizationName: 'Some Identity Provider',
          },
        ],
        featuredIdentityProviderCode: 'SOME_IDENTITY_PROVIDER',
      });
    });

    module('when it’s for login', function () {
      test('it displays a login heading', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('components.authentication.identity-providers-authentication.login.heading'),
            }),
          )
          .exists();
      });
    });

    module('when it’s for signup', function () {
      test('it displays a signup heading', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication @isForSignup="true" /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('components.authentication.identity-providers-authentication.signup.heading'),
            }),
          )
          .exists();
      });
    });
  });

  module('when there are no identity providers', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner);
    });

    module('when it’s for login', function () {
      test('it doesn’t display a login heading', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication /></template>);

        // then
        assert
          .dom(screen.queryByText(t('components.authentication.identity-providers-authentication.login.heading')))
          .doesNotExist();
      });
    });

    module('when it’s for signup', function () {
      test('it doesn’t display a signup heading', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication @isForSignup="true" /></template>);

        // then
        assert
          .dom(screen.queryByText(t('components.authentication.identity-providers-authentication.signup.heading')))
          .doesNotExist();
      });
    });
  });

  module('when there is a featured identity provider', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'some-identity-provider',
            slug: 'some-identity-provider',
            code: 'SOME_IDENTITY_PROVIDER',
            organizationName: 'Some Identity Provider',
          },
        ],
        featuredIdentityProviderCode: 'SOME_IDENTITY_PROVIDER',
      });

      const router = this.owner.lookup('service:router');
      sinon.stub(router, 'transitionTo');
    });

    module('when it’s for login', function () {
      test('it displays a login featured identity provider button, disabled when clicked', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication /></template>);

        // then
        const button = await screen.findByRole('button', {
          name: t(
            'components.authentication.identity-providers-authentication.login.login-with-featured-identity-provider-link',
            {
              featuredIdentityProvider: 'Some Identity Provider',
            },
          ),
        });
        assert.dom(button).exists();

        // when
        await click(button);

        // then
        assert.strictEqual(button.getAttribute('aria-disabled'), 'true');
      });
    });

    module('when it’s for signup', function () {
      test('it displays a signup featured identity provider button', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication @isForSignup="true" /></template>);

        // then
        const button = await screen.findByRole('button', {
          name: t(
            'components.authentication.identity-providers-authentication.signup.signup-with-featured-identity-provider-link',
            {
              featuredIdentityProvider: 'Some Identity Provider',
            },
          ),
        });
        assert.dom(button).exists();
      });
    });
  });

  module('when there is no featured identity provider', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner);
    });

    test('it doesn’t display a continue featured identity provider link', async function (assert) {
      // when
      const screen = await render(<template><IdentityProvidersAuthentication /></template>);

      // then
      assert
        .dom(
          screen.queryByText(
            t(
              'components.authentication.identity-providers-authentication.login.login-with-featured-identity-provider-link',
              {
                featuredIdentityProvider: 'Some Identity Provider',
              },
            ),
          ),
        )
        .doesNotExist();
      assert
        .dom(
          screen.queryByText(
            t(
              'components.authentication.identity-providers-authentication.signup.signup-with-featured-identity-provider-link',
              {
                featuredIdentityProvider: 'Some Identity Provider',
              },
            ),
          ),
        )
        .doesNotExist();
    });
  });

  module('when there are other identity providers', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'some-identity-provider',
            slug: 'some-identity-provider',
            code: 'SOME_IDENTITY_PROVIDER',
            organizationName: 'Some Identity Provider',
          },
          { id: 'cem', slug: 'cem', code: 'CEM', organizationName: 'ConnectEtMoi' },
        ],
        featuredIdentityProviderCode: 'SOME_IDENTITY_PROVIDER',
      });
    });

    module('when it’s for login', function () {
      test('it displays a select another organization link', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication /></template>);

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.identity-providers-authentication.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/connexion/sso-selection');
      });
    });

    module('when it’s for signup', function () {
      test('it displays a select another organization link', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication @isForSignup={{true}} /></template>);

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.identity-providers-authentication.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/inscription/sso-selection');
      });
    });

    module('when the featured identity provider button is clicked', function (hooks) {
      hooks.beforeEach(function () {
        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');
      });

      test('it disables the other identity providers button link', async function (assert) {
        // when
        const screen = await render(<template><IdentityProvidersAuthentication /></template>);

        // then
        const button = await screen.findByRole('button', {
          name: t(
            'components.authentication.identity-providers-authentication.login.login-with-featured-identity-provider-link',
            {
              featuredIdentityProvider: 'Some Identity Provider',
            },
          ),
        });
        assert.dom(button).exists();

        const link = await screen.findByRole('link', {
          name: t('components.authentication.identity-providers-authentication.select-another-organization-link'),
        });
        assert.dom(link).exists();

        // when
        await click(button);

        // then
        assert.strictEqual(link.getAttribute('aria-disabled'), 'true');
      });
    });
  });

  module('when there are no other identity providers', function (hooks) {
    hooks.beforeEach(function () {
      stubOidcIdentityProvidersService(this.owner, {
        oidcIdentityProviders: [
          {
            id: 'some-identity-provider',
            slug: 'some-identity-provider',
            code: 'SOME_IDENTITY_PROVIDER',
            organizationName: 'Some Identity Provider',
          },
        ],
        featuredIdentityProviderCode: 'SOME_IDENTITY_PROVIDER',
      });
    });

    test('it doesn’t display a select another organization link', async function (assert) {
      // when
      const screen = await render(<template><IdentityProvidersAuthentication /></template>);

      // then
      assert
        .dom(
          screen.queryByText(
            t('components.authentication.identity-providers-authentication.select-another-organization-link'),
          ),
        )
        .doesNotExist();
    });
  });
});
