import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ListItems from 'pix-admin/components/users/list-items';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/users | list-items', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFiltering = () => {};

  test('it should display user list', async function (assert) {
    // given
    const users = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.net' },
      { id: 2, firstName: 'Jane', lastName: 'Dae', email: 'jane.dae@example.org' },
      { id: 3, firstName: 'Lola', lastName: 'Lile', email: 'lola.lile@example.net' },
    ];
    users.meta = {
      rowCount: 3,
    };

    // when
    const screen = await render(
      <template><ListItems @users={{users}} @triggerFiltering={{triggerFiltering}} /></template>,
    );

    // then
    const table = screen.getByRole('table', { name: t('components.users.list-items.table.caption') });
    const rows = within(table).getAllByRole('row');
    assert.dom(within(table).getByRole('cell', { name: 'John' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'Doe' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'john.doe@example.net' })).exists();
    assert.dom(within(table).getByRole('cell', { name: '1' })).exists();
    assert.dom(within(table).getByRole('link', { name: '1' })).exists();
    assert.strictEqual(rows.length, 4);
  });
});
