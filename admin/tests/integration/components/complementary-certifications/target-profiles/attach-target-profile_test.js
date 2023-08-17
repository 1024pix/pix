import { render, waitFor } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::AttachTargetProfile', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  test('it should display a search box', async function (assert) {
    // given
    // when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachTargetProfile />`);

    // then
    assert.dom(screen.getByRole('searchbox', { name: 'ID du profil cible' })).exists();
  });

  test('it should display the provided search results', async function (assert) {
    // given
    const options = [{ label: '3 - ALEX TARGET' }];
    this.set('options', options);

    // when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachTargetProfile
      @options={{this.options}}
    />`);

    // then
    const searchResult = await screen.findByRole('option', { name: '3 - ALEX TARGET' });
    assert.dom(searchResult).exists();
  });

  test('it should trigger handler search function when the user is entering search terms', async function (assert) {
    // given
    const onSearchStub = sinon.stub();
    this.set('onSearchStub', onSearchStub);

    // when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachTargetProfile
      @onSearch={{this.onSearchStub}}
    />`);
    const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
    await fillIn(input, '3');

    // then
    sinon.assert.calledWithExactly(this.onSearchStub, '3');
    assert.ok(true);
  });

  test('it should trigger handler function when a target profile is selected', async function (assert) {
    // given
    const options = [{ id: 3, label: '3 - ALEX TARGET' }];
    this.set('options', options);
    const onSelectionStub = sinon.stub();

    this.set('onSelection', onSelectionStub);

    // when
    const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachTargetProfile
      @onSelection={{this.onSelection}}
      @options={{this.options}}
  />`);
    await waitFor(async () => {
      await screen.findByRole('listbox');
    });
    const targetProfileSelectable = screen.getByRole('option', { name: '3 - ALEX TARGET' });
    await targetProfileSelectable.click();

    // then
    assert.ok(true);
    sinon.assert.calledWithExactly(onSelectionStub, {
      id: 3,
      label: '3 - ALEX TARGET',
    });
  });
});
