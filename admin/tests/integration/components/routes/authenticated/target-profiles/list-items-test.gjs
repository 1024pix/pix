import { render } from '@1024pix/ember-testing-library';
import ListSummaryItems from 'pix-admin/components/target-profiles/list-summary-items';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/target-profiles | list-items', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFiltering = function () {};
  const goToTargetProfilePage = function () {};

  test('it should display header with name, id and status', async function (assert) {
    // when
    const screen = await render(
      <template>
        <ListSummaryItems @triggerFiltering={{triggerFiltering}} @goToTargetProfilePage={{goToTargetProfilePage}} />
      </template>,
    );

    // then
    assert.ok(screen.getByText(t('common.fields.id')));
    assert.ok(screen.getByText(t('common.fields.name')));
    assert.ok(screen.getByText(t('common.fields.status')));
  });

  test('it should display search inputs', async function (assert) {
    // when
    const screen = await render(
      <template>
        <ListSummaryItems @triggerFiltering={{triggerFiltering}} @goToTargetProfilePage={{goToTargetProfilePage}} />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: t('pages.target-profiles.filters.search-by-id.name') })).exists();
    assert.dom(screen.getByRole('textbox', { name: t('pages.target-profiles.filters.search-by-name.name') })).exists();
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
      <template>
        <ListSummaryItems
          @summaries={{summaries}}
          @triggerFiltering={{triggerFiltering}}
          @goToTargetProfilePage={{goToTargetProfilePage}}
        />
      </template>,
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
      <template>
        <ListSummaryItems
          @summaries={{summaries}}
          @triggerFiltering={{triggerFiltering}}
          @goToTargetProfilePage={{goToTargetProfilePage}}
        />
      </template>,
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
      <template>
        <ListSummaryItems
          @summaries={{summaries}}
          @triggerFiltering={{triggerFiltering}}
          @goToTargetProfilePage={{goToTargetProfilePage}}
        />
      </template>,
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
      <template>
        <ListSummaryItems
          @summaries={{summaries}}
          @triggerFiltering={{triggerFiltering}}
          @goToTargetProfilePage={{goToTargetProfilePage}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Actif')).exists();
  });
});
