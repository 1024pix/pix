import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import OidcProviderSelector from 'mon-pix/components/authentication/oidc-provider-selector';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication | oidc-provider-selector', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays an Oidc Provider selector with correct labels', async function (assert) {
    //given
    class OidcProvidersServiceStub extends Service {
      get list() {
        return [
          { id: '1', organizationName: 'ConnectEtMoi' },
          { id: '2', organizationName: 'StarConnect' },
        ];
      }
    }
    this.owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);

    //when
    const screen = await render(<template><OidcProviderSelector /></template>);
    await click(screen.getByRole('button', { name: 'Rechercher une organisation' }));
    await screen.findByRole('listbox');

    //then
    assert.dom(screen.getAllByText('Sélectionner un organisme')[0]).exists();
    assert.dom(screen.getByText('Recherche par mot clé')).exists();
    assert.dom(screen.getByText('Rechercher une organisation')).exists();
    assert.dom(screen.getByText('ConnectEtMoi')).isVisible();
  });

  test('it displays a sorted list of oidc providers', async function (assert) {
    // given
    class OidcProvidersServiceStub extends Service {
      get list() {
        return [
          { id: '1', organizationName: 'Third' },
          { id: '2', organizationName: 'Second' },
          { id: '3', organizationName: 'First' },
        ];
      }
    }
    this.owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);

    // when
    const screen = await render(<template><OidcProviderSelector /></template>);
    await click(screen.getByRole('button', { name: 'Rechercher une organisation' }));
    await screen.findByRole('listbox');

    // then
    const options = await screen.findAllByRole('option');
    const optionsLabels = options.map((option) => option.innerText);

    assert.deepEqual(optionsLabels, ['First', 'Second', 'Third']);
  });

  module('when user selects a provider', function () {
    test('it triggers the onProviderChange property', async function (assert) {
      // given
      class OidcProvidersServiceStub extends Service {
        get list() {
          return [
            { id: '1', organizationName: 'ConnectEtMoi' },
            { id: '2', organizationName: 'StarConnect' },
          ];
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcProvidersServiceStub);

      const onProviderChangeStub = sinon.stub();

      // when
      const screen = await render(
        <template><OidcProviderSelector @onProviderChange={{onProviderChangeStub}} /></template>,
      );
      await click(screen.getByRole('button', { name: 'Rechercher une organisation' }));
      await screen.findByRole('listbox');

      await click(screen.getByRole('option', { name: 'ConnectEtMoi' }));

      // then
      assert.ok(onProviderChangeStub.calledWith('1'));
    });
  });
});
