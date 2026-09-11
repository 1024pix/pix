import { fillByLabel, render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import SelectSearchWrapper from 'pix-admin/components/ui/select-search-wrapper';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ui/select-search-wrapper', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('search behavious', function () {
    test('it filters list of options case and accent insensitive, when searching through them', async function (assert) {
      // given
      const options = [
        { key: '1', label: 'Pomme' },
        { key: '2', label: 'Pêche' },
        { key: '3', label: 'Pastèque' },
      ];

      const texts = { placeholder: 'Sélectionner un fruit', searchPlaceholder: 'Rechercher un fruit' };

      // when
      const screen = await render(
        <template>
          <SelectSearchWrapper @options={{options}} @texts={{texts}} @hideDefaultOption={{true}}>
            <:label>
              Options de fruits
            </:label>
          </SelectSearchWrapper>
        </template>,
      );

      const button = screen.getByRole('button', {
        name: 'Options de fruits',
      });
      await button.click();
      const list = await screen.findByRole('listbox');

      await fillByLabel(t('common.actions.search'), 'pasteque');
      const results = within(list).getAllByRole('option');

      // then
      assert.strictEqual(results.length, 1);
      assert.dom(screen.getByRole('option', { name: 'Pastèque' })).exists();
    });

    test('it displays generic message when no results found', async function (assert) {
      // given
      const options = [
        { key: '1', label: 'Pomme' },
        { key: '2', label: 'Pêche' },
        { key: '3', label: 'Pastèque' },
      ];

      const texts = { placeholder: 'Sélectionner un fruit', searchPlaceholder: 'Rechercher un fruit' };

      // when
      const screen = await render(
        <template>
          <SelectSearchWrapper @options={{options}} @texts={{texts}} @hideDefaultOption={{true}}>
            <:label>
              Options de fruits
            </:label>
          </SelectSearchWrapper>
        </template>,
      );

      const button = screen.getByRole('button', {
        name: 'Options de fruits',
      });
      await button.click();
      await screen.findByRole('listbox');

      await fillByLabel(t('common.actions.search'), 'jghbebwer');

      // then
      assert.dom(screen.getByText(t('common.no-results'))).exists();
    });

    test('it uses @texts.selectSearchLabel instead of default if present', async function (assert) {
      // given
      const options = [
        { key: '1', label: 'Pomme' },
        { key: '2', label: 'Pêche' },
        { key: '3', label: 'Pastèque' },
      ];

      const texts = {
        selectSearchLabel: 'Rechercher un fruit',
        placeholder: 'Sélectionner un fruit',
        searchPlaceholder: 'Rechercher un fruit',
      };

      // when
      const screen = await render(
        <template>
          <SelectSearchWrapper @options={{options}} @texts={{texts}} @hideDefaultOption={{true}}>
            <:label>
              Options de fruits
            </:label>
          </SelectSearchWrapper>
        </template>,
      );

      const button = screen.getByRole('button', {
        name: 'Options de fruits',
      });
      await button.click();
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Rechercher un fruit' })).exists();
      assert.dom(screen.queryByRole('textbox', { name: 'Rechercher' })).doesNotExist();
    });
  });
});
