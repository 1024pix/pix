import { clickByName, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import SsoSelectionForm from 'mon-pix/components/authentication/sso-selection-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubOidcIdentityProvidersService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | SsoSelectionForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const oidcProvidersServiceStub = stubOidcIdentityProvidersService(this.owner, {
      oidcIdentityProviders: [
        { id: 'cem', slug: 'cem', code: 'CEM', organizationName: 'ConnectEtMoi', isVisible: true },
        {
          id: 'HIDDEN1',
          code: 'HIDDEN1',
          slug: 'hidden1',
          organizationName: 'Not displayed provider 1',
          isVisible: false,
        },
        { id: 'sc', slug: 'sc', code: 'SC', organizationName: 'StarConnect', isVisible: true },
        { id: 'fer', slug: 'fer', code: 'FER', organizationName: 'FER', isVisible: true },
        {
          id: 'HIDDEN2',
          code: 'HIDDEN2',
          slug: 'hidden2',
          organizationName: 'Not displayed provider 1',
          isVisible: false,
        },
      ],
    });
    oidcProvidersServiceStub.shouldDisplayAccountRecoveryBanner = (identityProviderCode) => {
      return identityProviderCode == 'FER';
    };

    const router = this.owner.lookup('service:router');
    sinon.stub(router, 'transitionTo');
  });

  test('it renders the component', async function (assert) {
    // when
    const screen = await render(<template><SsoSelectionForm /></template>);

    // then
    const button = await screen.findByRole('button', {
      name: t('pages.authentication.sso-selection.login.button'),
    });
    assert.dom(button).hasAttribute('aria-disabled');
  });

  test('it displays an identity provider button, disabled when clicked', async function (assert) {
    // given
    const providerName = 'ConnectEtMoi';

    // when
    const screen = await render(<template><SsoSelectionForm /></template>);
    await clickByName(t('components.authentication.oidc-provider-selector.label'));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: providerName }));

    // then
    const button = await screen.findByRole('button', {
      name: t('pages.authentication.sso-selection.login.button'),
    });
    assert.dom(button).exists();

    const connexionMessage = await screen.findByText(
      t('pages.authentication.sso-selection.login.message', { providerName }),
    );
    assert.dom(connexionMessage).exists();

    // when
    await click(button);

    // then
    assert.strictEqual(button.getAttribute('aria-disabled'), 'true');
  });

  test('it excludes not-visible providers', async function (assert) {
    // when
    const screen = await render(<template><SsoSelectionForm /></template>);
    await clickByName(t('components.authentication.oidc-provider-selector.label'));
    await screen.findByRole('listbox');

    // then
    const options = await screen.findAllByRole('option');
    const optionsLabels = options.map((option) => option.innerText);

    assert.deepEqual(optionsLabels, ['ConnectEtMoi', 'FER', 'StarConnect']);
  });

  test('it displays an account recovery banner if SSO is FER', async function (assert) {
    // when
    const screen = await render(<template><SsoSelectionForm /></template>);
    await clickByName(t('components.authentication.oidc-provider-selector.label'));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'FER' }));

    // then
    assert.dom(screen.getByText(/récupérer.*compte/i)).exists();
  });
});
