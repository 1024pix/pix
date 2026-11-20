import { render as renderScreen } from '@1024pix/ember-testing-library';
import List from 'pix-admin/components/organizations/network/list';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/network/list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('display children organizations list', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const organization1 = store.createRecord('organization', {
      id: '1',
      name: 'Collège The Night Watch',
      externalId: 'UA123456',
    });
    const organization2 = store.createRecord('organization', {
      id: '2',
      name: 'Lycée KingsLanding',
      externalId: 'UB64321',
    });
    const organizations = [organization1, organization2];

    //  when
    const screen = await renderScreen(<template><List @childOrganizations={{organizations}} /></template>);

    // then
    assert
      .dom(screen.getByRole('table', { name: t('components.organizations.network.children-list.table-name') }))
      .exists();

    assert.dom(screen.getByRole('columnheader', { name: 'ID' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Identifiant externe' })).exists();

    assert.strictEqual((await screen.findAllByRole('row')).length, 3);

    assert.dom(screen.getByRole('cell', { name: 'Collège The Night Watch' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Lycée KingsLanding' })).exists();
  });
});
