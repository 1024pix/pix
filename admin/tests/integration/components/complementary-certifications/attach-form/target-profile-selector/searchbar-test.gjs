import { render } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Searchbar from 'pix-admin/components/complementary-certifications/attach-badges/target-profile-selector/searchbar';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | complementary-certifications/attach-badges/target-profile-selector/searchbar',
  function (hooks) {
    setupIntlRenderingTest(hooks);
    setupMirage(hooks);

    test('it should display a search box', async function (assert) {
      // given
      // when
      const screen = await render(<template><Searchbar /></template>);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'ID du profil cible' })).exists();
    });

    test('it should display the provided search results', async function (assert) {
      // given
      const options = [{ label: '3 - ALEX TARGET' }];

      // when
      const screen = await render(<template><Searchbar @options={{options}} /></template>);

      // then
      const searchResult = await screen.findByRole('option', { name: '3 - ALEX TARGET' });
      assert.dom(searchResult).exists();
    });

    module('when the search returns no results', function () {
      test('it should display the no results message', async function (assert) {
        // given & when
        const screen = await render(<template><Searchbar @isNoResult={{true}} /></template>);

        // then
        assert.dom(screen.getByText('Aucun résultat')).exists();
      });
    });

    module('when the search is in progress', function () {
      test('it should display the loader message', async function (assert) {
        // given
        const isLoading = true;
        // when
        const screen = await render(<template><Searchbar @isLoading={{isLoading}} /></template>);

        // then
        assert.dom(screen.getByRole('progressbar', { value: 'Recherche en cours...' })).exists();
      });
    });

    module('when the search is not in progress', function () {
      test('it should not display the loader message', async function (assert) {
        // given
        const isLoading = false;
        // when
        const screen = await render(<template><Searchbar @isLoading={{isLoading}} /></template>);

        // then
        assert.dom(screen.queryByRole('progressbar')).doesNotExist();
      });
    });

    module('when the user is entering search terms', function () {
      test('it should trigger handler onSearch function', async function (assert) {
        // given
        const onSearchStub = sinon.stub();

        // when
        const screen = await render(<template><Searchbar @onSearch={{onSearchStub}} /></template>);
        const input = screen.getByRole('textbox', { name: 'ID du profil cible' });
        await fillIn(input, '3');

        // then
        sinon.assert.calledWithExactly(onSearchStub, '3');
        assert.ok(true);
      });
    });

    module('when a target profile is selected', function () {
      test('it should trigger handler onSelection function', async function (assert) {
        // given
        const options = [{ id: 3, label: '3 - ALEX TARGET' }];
        const onSelectionStub = sinon.stub();

        // when
        const screen = await render(
          <template><Searchbar @onSelection={{onSelectionStub}} @options={{options}} /></template>,
        );
        const targetProfileSelectable = await screen.findByRole('option', { name: '3 - ALEX TARGET' });
        await targetProfileSelectable.click();

        // then
        assert.ok(true);
        sinon.assert.calledWithExactly(onSelectionStub, {
          id: 3,
          label: '3 - ALEX TARGET',
        });
      });
    });
  },
);
