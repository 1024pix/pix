import { render } from '@1024pix/ember-testing-library';
import ListItem from 'pix-admin/components/organizations/network/list-item';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/network/list-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays child organization items', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization', {
      id: '1',
      name: 'Collège The Night Watch',
      externalId: 'UA123456',
    });

    // when
    const screen = await render(<template><ListItem @childOrganization={{organization}} /></template>);

    // then
    assert.ok(screen.getByRole('cell', { name: '1' }));
    assert.ok(screen.getByRole('cell', { name: 'Collège The Night Watch' }));
    assert.ok(screen.getByRole('cell', { name: 'UA123456' }));
    assert.notOk(
      screen.queryByRole('button', { name: t('components.organizations.network.children-list.actions.detach.button') }),
    );
  });
});
