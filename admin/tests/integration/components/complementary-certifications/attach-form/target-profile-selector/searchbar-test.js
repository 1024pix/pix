import { render } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
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
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar />`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'ID du profil cible' })).exists();
    });

    test('it should display the provided search results', async function (assert) {
      // given
      const options = [{ label: '3 - ALEX TARGET' }];
      this.set('options', options);

      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar
        @options={{this.options}}
      />`);

      // then
      const searchResult = await screen.findByRole('option', { name: '3 - ALEX TARGET' });
      assert.dom(searchResult).exists();
    });

    module('when the search returns no results', function () {
      test('it should display the no results message', async function (assert) {
        // given & when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar
         @isNoResult={{true}}
        />`);

        // then
        assert.dom(screen.getByText('Aucun résultat')).exists();
      });
    });

    module('when the search is in progress', function () {
      test('it should display the loader message', async function (assert) {
        // given
        const isLoading = true;
        this.set('isLoading', isLoading);
        // when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar
          @isLoading={{this.isLoading}}
        />`);

        // then
        assert.dom(screen.getByRole('progressbar', { value: 'Recherche en cours...' })).exists();
      });
    });

    module('when the search is not in progress', function () {
      test('it should not display the loader message', async function (assert) {
        // given
        const isLoading = false;
        this.set('isLoading', isLoading);
        // when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar
          @isLoading={{this.isLoading}}
        />`);

        // then
        assert.dom(screen.queryByRole('progressbar')).doesNotExist();
      });
    });

    module('when the user is entering search terms', function () {
      test('it should trigger handler onSearch function', async function (assert) {
        // given
        const onSearchStub = sinon.stub();
        this.set('onSearchStub', onSearchStub);

        // when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar
          @onSearch={{this.onSearchStub}}
        />`);
        const input = screen.getByRole('textbox', { name: 'ID du profil cible' });
        await fillIn(input, '3');

        // then
        sinon.assert.calledWithExactly(this.onSearchStub, '3');
        assert.ok(true);
      });
    });

    module('when a target profile is selected', function () {
      test('it should trigger handler onSelection function', async function (assert) {
        // given
        const options = [{ id: 3, label: '3 - ALEX TARGET' }];
        this.set('options', options);
        const onSelectionStub = sinon.stub();

        this.set('onSelection', onSelectionStub);

        // when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::TargetProfileSelector::Searchbar
            @onSelection={{this.onSelection}}
            @options={{this.options}}
        />`);
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
