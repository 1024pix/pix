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
      { id: 'cem', organizationName: 'ConnectEtMoi' },
      { id: 'sc', organizationName: 'StarConnect' },
    ];
  }
}

module('Integration | Component | Authentication | SsoSelectionForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the component', async function (assert) {
    //given
    this.owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);

    //when
    const screen = await render(<template><SsoSelectionForm /></template>);

    // then
    const buttonLink = await screen.findByRole('button', { name: t('pages.authentication.sso-selection.signin.link') });
    assert.dom(buttonLink).hasAttribute('disabled');
  });

  test('it selects a provider', async function (assert) {
    //given
    this.owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);

    //when
    const screen = await render(<template><SsoSelectionForm /></template>);
    await clickByName(t('components.authentication.oidc-provider-selector.label'));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'ConnectEtMoi' }));

    // then
    const buttonLink = await screen.findByRole('link', { name: t('pages.authentication.sso-selection.signin.link') });
    assert.strictEqual(buttonLink.getAttribute('href'), '/connexion/cem');
  });
});
