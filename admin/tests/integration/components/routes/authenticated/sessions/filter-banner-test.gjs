import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import FilterBanner from 'pix-admin/components/sessions/filter-banner';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/sessions | filter-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFiltering = () => {};

  module('Input field for ids filtering', function () {
    test('it should render a input field to filter on ids', async function (assert) {
      // when
      const screen = await render(<template><FilterBanner @triggerFiltering={{triggerFiltering}} /></template>);

      // then
      assert.dom(screen.getByRole('textbox', { name: t('pages.sessions.list.filters.ids.aria-label') })).exists();
    });
  });

  module('Input field for certificationCenterName filtering', function () {
    test('it should render a input field to filter on certificationCenterName', async function (assert) {
      // when
      const screen = await render(<template><FilterBanner @triggerFiltering={{triggerFiltering}} /></template>);

      // then
      assert
        .dom(screen.getByRole('textbox', { name: "Filtrer les sessions avec le nom d'un centre de certification" }))
        .exists();
    });
  });

  module('Dropdown menu for certification center type filtering', function () {
    test('it should render a dropdown menu to filter sessions on their certification center type', async function (assert) {
      // given
      const screen = await render(<template><FilterBanner @triggerFiltering={{triggerFiltering}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sessions.table.headers.type'),
        }),
      );
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('option', { name: 'Tous' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Pro' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Sco' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Sup' })).exists();
    });

    test('it should call onChangeFilter with certificationCenterType when it has changed', async function (assert) {
      // given
      const filters = { certificationCenterType: 'SCO' };
      const onChangeFilter = sinon.stub();
      const screen = await render(
        <template>
          <FilterBanner
            @filters={{filters}}
            @onChangeFilter={{onChangeFilter}}
            @triggerFiltering={{triggerFiltering}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sessions.table.headers.type'),
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Pro' }));

      // then
      assert.ok(onChangeFilter.calledWith('certificationCenterType', 'PRO'));
    });
  });

  module('Dropdown menu for status filtering', function () {
    test('it should render a dropdown menu to filter sessions on their status', async function (assert) {
      // given
      const screen = await render(<template><FilterBanner @triggerFiltering={{triggerFiltering}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sessions.table.headers.status'),
        }),
      );
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('option', { name: 'Tous' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Créée' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Finalisée' })).exists();
      assert.dom(screen.getByRole('option', { name: 'En cours de traitement' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Résultats transmis par Pix' })).exists();
    });

    test('it should filter sessions on (session) "status" when it has changed', async function (assert) {
      // given
      const filters = { status: 'finalized' };
      const onChangeFilter = sinon.stub();
      const screen = await render(
        <template>
          <FilterBanner
            @filters={{filters}}
            @onChangeFilter={{onChangeFilter}}
            @triggerFiltering={{triggerFiltering}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sessions.table.headers.status'),
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Créée' }));

      // then
      assert.ok(onChangeFilter.calledWith('status', 'created'));
    });
  });

  module('Version filtering', function () {
    test('it should render a dropdown menu to filter sessions on their status', async function (assert) {
      // given
      const screen = await render(<template><FilterBanner @triggerFiltering={{triggerFiltering}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sessions.list.filters.version.label'),
        }),
      );
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('option', { name: 'Tous' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Sessions V2' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Sessions V3' })).exists();
    });

    test('it should call onChangeFilter with version on option change', async function (assert) {
      // given
      const filters = { version: 2 };
      const onChangeFilter = sinon.stub();

      const screen = await render(
        <template>
          <FilterBanner
            @filters={{filters}}
            @onChangeFilter={{onChangeFilter}}
            @triggerFiltering={{triggerFiltering}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sessions.list.filters.version.label'),
        }),
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Sessions V3' }));

      // then
      assert.ok(onChangeFilter.calledWith('version', '3'));
    });
  });
});
