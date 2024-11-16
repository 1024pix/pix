import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import SsoSelectionForm from 'mon-pix/components/authentication/sso-selection-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

class OidcProvidersServiceStub extends Service {
  get list() {
    return [
      { id: 'cem', code: 'CEM', organizationName: 'ConnectEtMoi' },
      { id: 'sc', code: 'SC', organizationName: 'StarConnect' },
      { id: 'hidden1', code: 'FWB', organizationName: 'Not displayed provider 1' },
      { id: 'hidden2', code: 'GOOGLE', organizationName: 'Not displayed provider 2' },
    ];
  }
}

module('Integration | Component | Authentication | SsoSelectionForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);
  });

  test('it renders the component', async function (assert) {
    //when
    const screen = await render(<template><SsoSelectionForm /></template>);

    // then
    const buttonLink = await screen.findByRole('button', {
      name: t('pages.authentication.sso-selection.signin.button'),
    });
    assert.dom(buttonLink).hasAttribute('disabled');
  });

  test('it selects a provider', async function (assert) {
    // given
    const providerName = 'ConnectEtMoi';

    //when
    const screen = await render(<template><SsoSelectionForm /></template>);
    await clickByName(t('components.authentication.oidc-provider-selector.label'));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: providerName }));

    // then
    const buttonLink = await screen.findByRole('link', { name: t('pages.authentication.sso-selection.signin.button') });
    assert.strictEqual(buttonLink.getAttribute('href'), '/connexion/cem');

    const connexionMessage = await screen.findByText(
      t('pages.authentication.sso-selection.signin.message', { providerName }),
    );
    assert.dom(connexionMessage).exists();
  });

  test('it excludes some providers', async function (assert) {
    //when
    const screen = await render(<template><SsoSelectionForm /></template>);
    await clickByName(t('components.authentication.oidc-provider-selector.label'));
    await screen.findByRole('listbox');

    // then
    const options = await screen.findAllByRole('option');
    const optionsLabels = options.map((option) => option.innerText);

    assert.deepEqual(optionsLabels, ['ConnectEtMoi', 'StarConnect']);
  });
});
