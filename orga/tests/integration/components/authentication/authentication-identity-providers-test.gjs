import { render } from '@1024pix/ember-testing-library';
import AuthenticationIdentityProviders from 'pix-orga/components/authentication/authentication-identity-providers';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | authentication-identity-providers', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are identity providers', function (hooks) {
    hooks.beforeEach(function () {
      const oidcIdentityProviders = this.owner.lookup('service:oidcIdentityProviders');
      sinon.stub(oidcIdentityProviders, 'list').value([
        {
          id: 'cem',
          slug: 'cem',
          code: 'CEM',
          organizationName: 'ConnectEtMoi',
          isVisible: true,
        },
      ]);
    });

    module('when it’s for login through SSO', function () {
      test('it displays a select another organization link', async function (assert) {
        // when
        const screen = await render(<template><AuthenticationIdentityProviders /></template>);

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.authentication-identity-providers.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/connexion/sso-selection');
      });
    });

    module('when it’s for login through SSO with invitation', function () {
      test('it displays a select another organization link', async function (assert) {
        // when
        const screen = await render(
          <template><AuthenticationIdentityProviders @invitationCode="ABC" @invitationId="123" /></template>,
        );

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.authentication-identity-providers.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/connexion/sso-selection?code=ABC&invitationId=123');
      });
    });

    module('when it’s for signup through SSO', function () {
      test('it displays a select another organization link', async function (assert) {
        // when
        const screen = await render(<template><AuthenticationIdentityProviders @isForSignup={{true}} /></template>);

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.authentication-identity-providers.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(link.getAttribute('href'), '/connexion/sso-selection');
      });
    });

    module('when it’s for signup through SSO with invitation', function () {
      test('it displays a select another organization link', async function (assert) {
        // when
        const screen = await render(
          <template>
            <AuthenticationIdentityProviders @isForSignup={{true}} @invitationCode="ABC" @invitationId="123" />
          </template>,
        );

        // then
        const link = await screen.findByRole('link', {
          name: t('components.authentication.authentication-identity-providers.select-another-organization-link'),
        });
        assert.dom(link).exists();
        assert.strictEqual(
          link.getAttribute('href'),
          '/connexion/sso-selection?code=ABC&invitationId=123&isForSignup=true',
        );
      });
    });
  });

  module('when there are no identity providers', function (hooks) {
    hooks.beforeEach(function () {
      const oidcIdentityProviders = this.owner.lookup('service:oidcIdentityProviders');
      sinon.stub(oidcIdentityProviders, 'list').value([]);
    });

    module('when it’s for login through SSO', function () {
      test('it doesn’t display the identity providers login button', async function (assert) {
        // when
        const screen = await render(<template><AuthenticationIdentityProviders /></template>);

        // then
        const link = await screen.queryByRole('link', {
          name: t('components.authentication.authentication-identity-providers.select-another-organization-link'),
        });
        assert.dom(link).doesNotExist();
      });
    });

    module('when it’s for signup through SSO', function () {
      test('it doesn’t display the identity providers signup button', async function (assert) {
        // when
        const screen = await render(<template><AuthenticationIdentityProviders @isForSignup="true" /></template>);

        // then
        const link = await screen.queryByRole('link', {
          name: t('components.authentication.authentication-identity-providers.select-another-organization-link'),
        });
        assert.dom(link).doesNotExist();
      });
    });
  });
});
