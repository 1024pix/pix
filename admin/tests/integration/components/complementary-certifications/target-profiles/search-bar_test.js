import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { fillIn } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::SearchBar', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  test('it should display a search box', async function (assert) {
    // given
    // when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::SearchBar />`);

    // then
    assert.dom(screen.getByRole('searchbox', { name: 'ID du profil cible' })).exists();
  });

  test('it should display the provided search results', async function (assert) {
    // given
    const options = [{ label: '3 - ALEX TARGET' }];
    this.set('options', options);

    // when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::SearchBar
      @options={{this.options}}
    />`);

    // then
    const searchResult = await screen.findByRole('option', { name: '3 - ALEX TARGET' });
    assert.dom(searchResult).exists();
  });

  module('when the user is entering search terms', function () {
    test('it should trigger handler onSearch function', async function (assert) {
      // given
      const onSearchStub = sinon.stub();
      this.set('onSearchStub', onSearchStub);

      // when
      const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::SearchBar
        @onSearch={{this.onSearchStub}}
      />`);
      const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
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
      const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::SearchBar
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
});
