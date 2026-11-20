import { render, within } from '@1024pix/ember-testing-library';
import ListItems from 'pix-admin/components/networks/list-items';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Networks | ListItems', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('filter banner', function () {
    test('it renders a name filter input', async function (assert) {
      // given
      const triggerFiltering = sinon.stub();
      const networks = [];
      const name = 'réseau';

      // when
      const screen = await render(
        <template><ListItems @networks={{networks}} @name={{name}} @triggerFiltering={{triggerFiltering}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: t('components.networks.list.filters.name') })).exists();
      assert.dom(screen.getByRole('textbox', { name: t('components.networks.list.filters.name') })).hasValue('réseau');
    });

    test('the clear filters button is disabled when no filter is active', async function (assert) {
      // given
      const networks = [];
      const name = null;
      const triggerFiltering = sinon.stub();

      // when
      const screen = await render(
        <template><ListItems @networks={{networks}} @name={{name}} @triggerFiltering={{triggerFiltering}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: t('common.filters.actions.clear') })).hasAttribute('aria-disabled');
    });

    test('the clear filters button is enabled when a filter is active', async function (assert) {
      // given
      const networks = [];
      const name = 'réseau';
      const triggerFiltering = sinon.stub();

      // when
      const screen = await render(
        <template><ListItems @networks={{networks}} @name={{name}} @triggerFiltering={{triggerFiltering}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('button', { name: t('common.filters.actions.clear') }))
        .doesNotHaveAttribute('aria-disabled');
    });
  });

  module('when there are networks', function () {
    test('it renders a table with networks IDs and name', async function (assert) {
      // given
      const network1 = { id: 123, name: 'Network1' };
      const network2 = { id: 456, name: 'Network2' };
      const networks = [network1, network2];

      // when
      const screen = await render(<template><ListItems @networks={{networks}} /></template>);

      // then
      const table = screen.getByRole('table', {
        name: t('components.networks.list.table.caption'),
      });

      assert.dom(within(table).getByRole('cell', { name: network1.id })).exists();
      assert.dom(within(table).getByRole('cell', { name: network1.id })).exists();
      assert.dom(within(table).getByRole('cell', { name: network1.name })).exists();
      assert.dom(within(table).getByRole('cell', { name: network2.name })).exists();
    });
  });

  module('when there are no networks', function () {
    test('it does not render a table', async function (assert) {
      // given
      const networks = [];

      // when
      const screen = await render(<template><ListItems @networks={{networks}} /></template>);

      // then
      assert
        .dom(
          await screen.queryByRole('table', {
            name: t('components.networks.list.table.caption'),
          }),
        )
        .doesNotExist();

      assert.dom(screen.getByText(t('common.tables.empty-result'))).exists();
    });

    test('it does not render pagination controls', async function (assert) {
      // given
      const networks = [];

      // when
      const screen = await render(<template><ListItems @networks={{networks}} /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: /Aller à la page suivante/ })).doesNotExist();
    });
  });

  module('pagination', function () {
    test('it displays the next page button when there are multiple pages', async function (assert) {
      // given
      const networks = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Réseau ${i + 1}` }));
      networks.meta = { page: 1, pageSize: 10, rowCount: 12, pageCount: 2 };

      // when
      const screen = await render(<template><ListItems @networks={{networks}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: /Aller à la page suivante/ })).isEnabled();
    });
  });
});
