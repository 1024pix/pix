import { render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import InformationView from 'pix-admin/components/networks/information-view';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Networks | information-view', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display', function () {
    test('it should display network informations', async function (assert) {
      // given
      const network = EmberObject.create({
        id: 1,
        name: 'Réseau professionnel',
        headOrganization: { id: 555, name: 'ABC Toitures et ravalements' },
      });

      // when
      const screen = await render(<template><InformationView @network={{network}} /></template>);

      // then
      assert
        .dom(screen.getByText(t('components.networks.information-view.head-organization')).nextElementSibling)
        .hasText('ABC Toitures et ravalements');

      const headOrganizationIdElement = screen.getByText(
        t('components.networks.information-view.head-organization-id'),
      ).nextElementSibling;

      assert.dom(within(headOrganizationIdElement).getByText('555')).exists();
    });
  });
});
