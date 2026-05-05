import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import OidcProviderSelector from 'pix-orga/components/authentication/oidc-provider-selector';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const I18N_KEYS = {
  selectLabel: 'components.authentication.oidc-provider-selector.label',
  selectPlaceholder: 'components.authentication.oidc-provider-selector.placeholder',
  searchLabel: 'components.authentication.oidc-provider-selector.searchLabel',
};

module('Integration | Component | Authentication | oidc-provider-selector', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays a sorted list of oidc providers', async function (assert) {
    // given
    const providers = [
      { id: 'THIRD', code: 'THIRD', slug: 'third', organizationName: 'Third', isVisible: true },
      { id: 'SECOND', code: 'SECOND', slug: 'second', organizationName: 'Second', isVisible: true },
      { id: 'FIRST', code: 'FIRST', slug: 'first', organizationName: 'First', isVisible: true },
    ];

    // when
    const screen = await render(<template><OidcProviderSelector @providers={{providers}} /></template>);
    await click(screen.getByRole('button', { name: t(I18N_KEYS.selectLabel) }));
    await screen.findByRole('listbox');

    // then
    assert.dom(screen.getAllByText(t(I18N_KEYS.selectPlaceholder))[0]).exists();
    assert.dom(screen.getByPlaceholderText(t(I18N_KEYS.searchLabel))).exists();

    const options = await screen.findAllByRole('option');
    const optionsLabels = options.map((option) => option.innerText);
    assert.deepEqual(optionsLabels, ['First', 'Second', 'Third']);
  });

  module('when user selects a provider', function () {
    test('it triggers the onProviderChange property', async function (assert) {
      // given
      const providers = [
        {
          id: 'CONNECT_ET_MOI',
          code: 'CONNECT_ET_MOI',
          slug: 'connect-et-moi',
          organizationName: 'ConnectEtMoi',
          isVisible: true,
        },
        {
          id: 'STAR_CONNECT',
          code: 'STAR_CONNECT',
          slug: 'star-connect',
          organizationName: 'StarConnect',
          isVisible: true,
        },
      ];

      const onProviderChangeStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <OidcProviderSelector @providers={{providers}} @onProviderChange={{onProviderChangeStub}} />
        </template>,
      );
      await click(screen.getByRole('button', { name: t(I18N_KEYS.selectLabel) }));
      await screen.findByRole('listbox');

      await click(screen.getByRole('option', { name: 'ConnectEtMoi' }));

      // then
      sinon.assert.calledWith(onProviderChangeStub, 'connect-et-moi');
      assert.ok(true);
    });
  });
});
