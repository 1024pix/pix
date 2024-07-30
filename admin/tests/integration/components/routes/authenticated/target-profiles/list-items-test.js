import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/target-profiles | list-items', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const triggerFiltering = function () {};
    const goToTargetProfilePage = function () {};
    this.triggerFiltering = triggerFiltering;
    this.goToTargetProfilePage = goToTargetProfilePage;
  });

  test('it should display header with name, id and status', async function (assert) {
    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
  @triggerFiltering={{this.triggerFiltering}}
  @goToTargetProfilePage={{this.goToTargetProfilePage}}
/>`,
    );

    // then
    assert.dom(screen.getByText('ID')).exists();
    assert.dom(screen.getByText('Nom')).exists();
    assert.dom(screen.getByText('Statut')).exists();
  });

  test('it should display search inputs', async function (assert) {
    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
  @triggerFiltering={{this.triggerFiltering}}
  @goToTargetProfilePage={{this.goToTargetProfilePage}}
/>`,
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Filtrer les profils cible par un id' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Filtrer les profils cible par un nom' })).exists();
  });

  test('it should display target profile summaries list', async function (assert) {
    // given
    const summaries = [{ id: 1 }, { id: 2 }];
    summaries.meta = {
      rowCount: 2,
    };
    this.summaries = summaries;

    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
  @summaries={{this.summaries}}
  @triggerFiltering={{this.triggerFiltering}}
  @goToTargetProfilePage={{this.goToTargetProfilePage}}
/>`,
    );

    // then
    assert.strictEqual(screen.getAllByLabelText('Profil cible').length, 2);
  });

  test('it should display target profile summaries data', async function (assert) {
    // given
    const summaries = [{ id: 123, name: 'Profile Cible 1' }];
    summaries.meta = {
      rowCount: 2,
    };
    this.summaries = summaries;

    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
  @summaries={{this.summaries}}
  @triggerFiltering={{this.triggerFiltering}}
  @goToTargetProfilePage={{this.goToTargetProfilePage}}
/>`,
    );

    // then
    assert.dom(screen.getByLabelText('Profil cible')).containsText(123);
    assert.dom(screen.getByLabelText('Profil cible')).containsText('Profile Cible 1');
  });

  test('it should display target profile status as "Obsolète" when target profile is outdated', async function (assert) {
    // given
    const summaries = [{ id: 123, name: 'Profile Cible - outdated', outdated: true }];
    summaries.meta = {
      rowCount: 2,
    };
    this.summaries = summaries;

    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
  @summaries={{this.summaries}}
  @triggerFiltering={{this.triggerFiltering}}
  @goToTargetProfilePage={{this.goToTargetProfilePage}}
/>`,
    );

    // then
    assert.dom(screen.getByText('Obsolète')).exists();
  });

  test('it should display target profile status as "Actif" when target profile is not outdated', async function (assert) {
    // given
    const summaries = [{ id: 123, name: 'Profile Cible - active', outdated: false }];
    summaries.meta = {
      rowCount: 2,
    };
    this.summaries = summaries;

    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
  @summaries={{this.summaries}}
  @triggerFiltering={{this.triggerFiltering}}
  @goToTargetProfilePage={{this.goToTargetProfilePage}}
/>`,
    );

    // then
    assert.dom(screen.getByText('Actif')).exists();
  });
});
