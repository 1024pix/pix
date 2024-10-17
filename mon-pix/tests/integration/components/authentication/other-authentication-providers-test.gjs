import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import OtherAuthenticationProviders from 'mon-pix/components/authentication/other-authentication-providers';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | other-authentication-providers', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when it’s for login', function () {
    test('it displays a login heading', async function (assert) {
      // when
      const screen = await render(<template><OtherAuthenticationProviders /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('components.authentication.other-authentication-providers.login-heading'),
          }),
        )
        .exists();
    });
  });

  module('when it’s for signup', function () {
    test('it displays a signup heading', async function (assert) {
      // when
      const screen = await render(<template><OtherAuthenticationProviders @isForSignup="true" /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('components.authentication.other-authentication-providers.signup-heading'),
          }),
        )
        .exists();
    });
  });

  module('when there is a featured identity provider', function () {
    test('it displays a continue featured identity provider link', async function (assert) {
      // given
      class OidcIdentityProvidersServiceStub extends Service {
        get featuredIdentityProvider() {
          return { organizationName: 'Some Identity Provider', slug: 'some-identity-provider' };
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersServiceStub);

      // when
      const screen = await render(<template><OtherAuthenticationProviders /></template>);

      // then
      const link = await screen.findByRole('link', {
        name: t(
          'components.authentication.other-authentication-providers.continue-with-featured-identity-provider-link',
          {
            featuredIdentityProvider: 'Some Identity Provider',
          },
        ),
      });
      assert.dom(link).exists();
      assert.strictEqual(link.getAttribute('href'), '/connexion/some-identity-provider');
    });
  });

  module('when there isn’t any featured identity provider', function () {
    test('it doesn’t display a continue featured identity provider link', async function (assert) {
      // given
      class OidcIdentityProvidersServiceStub extends Service {
        get featuredIdentityProvider() {
          return null;
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersServiceStub);

      // when
      const screen = await render(<template><OtherAuthenticationProviders /></template>);

      // then
      assert
        .dom(
          screen.queryByText(
            t(
              'components.authentication.other-authentication-providers.continue-with-featured-identity-provider-link',
              {
                featuredIdentityProvider: 'Some Identity Provider',
              },
            ),
          ),
        )
        .doesNotExist();
    });
  });

  module('when there are other identity providers', function () {
    module('when it’s for login', function () {
      test('it displays a select another organization link', async function (assert) {
        // given
        class OidcIdentityProvidersServiceStub extends Service {
          get hasOtherIdentityProviders() {
            return true;
          }

          load() {
            return Promise.resolve();
          }
        }
        this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersServiceStub);

        // when
        const screen = await render(<template><OtherAuthenticationProviders /></template>);

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.other-authentication-providers.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/connexion/sso-selection');
      });
    });

    module('when it’s for signup', function () {
      test('it displays a select another organization link', async function (assert) {
        // given
        class OidcIdentityProvidersServiceStub extends Service {
          get hasOtherIdentityProviders() {
            return true;
          }

          load() {
            return Promise.resolve();
          }
        }
        this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersServiceStub);

        // when
        const screen = await render(<template><OtherAuthenticationProviders @isForSignup={{true}} /></template>);

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.other-authentication-providers.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/inscription/sso-selection');
      });
    });
  });

  module('when there aren’t any other identity providers', function () {
    test('it doesn’t display a select another organization link', async function (assert) {
      // given
      class OidcIdentityProvidersServiceStub extends Service {
        get hasOtherIdentityProviders() {
          return false;
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersServiceStub);

      // when
      const screen = await render(<template><OtherAuthenticationProviders /></template>);

      // then
      assert
        .dom(
          screen.queryByText(
            t('components.authentication.other-authentication-providers.select-another-organization-link'),
          ),
        )
        .doesNotExist();
    });
  });
});
