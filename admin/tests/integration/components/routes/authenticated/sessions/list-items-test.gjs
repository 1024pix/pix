import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ListItems from 'pix-admin/components/sessions/list-items';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/sessions | list-items', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFiltering = () => {};

  test('it should display sessions list', async function (assert) {
    // given
    const date = new Date();
    const finalizedAt = new Date('2020-08-14T00:00:00Z');
    const publishedAt = new Date('2020-06-14T00:00:00Z');
    const resultsSentToPrescriberAt = new Date('2020-08-15T00:00:00Z');
    const displayStatus = 'SomeStatus';
    const sessions = [
      {
        id: 1,
        certificationCenterName: 'Centre A',
        certificationCenterExternalId: 'EXTIDA',
        certificationCenterType: 'SUP',
        date,
        time: '14:00:00',
        displayStatus,
        finalizedAt: '',
        publishedAt: '',
        resultsSentToPrescriberAt: '',
      },
      {
        id: 2,
        certificationCenterName: 'Centre B',
        certificationCenterExternalId: 'EXTIDB',
        certificationCenterType: null,
        date,
        time: '14:00:00',
        displayStatus,
        finalizedAt,
        publishedAt,
        resultsSentToPrescriberAt,
      },
    ];
    const displayedDate = date.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayedFinalizedAt = finalizedAt.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const displayedPublishedAt = publishedAt.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    sessions.meta = { rowCount: 2 };

    // when
    await render(<template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>);

    // then
    assert.dom('table tbody tr').exists({ count: sessions.length });
    for (let i = 0; i < sessions.length; ++i) {
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`).hasText(sessions[i].id.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(3)`).hasText(sessions[i].certificationCenterName);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(6)`)
        .hasText(displayedDate + ' à ' + sessions[i].time);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(7)`).hasText(sessions[i].displayStatus);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(8)`)
        .hasText(sessions[i].finalizedAt ? displayedFinalizedAt : sessions[i].finalizedAt);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(9)`)
        .hasText(sessions[i].publishedAt ? displayedPublishedAt : sessions[i].publishedAt);
    }
    // Colonne : Centre de certification
    assert.dom('table tbody tr:nth-child(1) td:nth-child(4)').hasText(sessions[0].certificationCenterExternalId);
    assert.dom('table tbody tr:nth-child(1) td:nth-child(5)').hasText(sessions[0].certificationCenterType);
    assert.dom('table tbody tr:nth-child(2) td:nth-child(5)').hasText('-');
  });

  module('Rows selection', function () {
    function buildSessions() {
      const sessions = [
        { id: 1, certificationCenterName: 'Centre A', displayStatus: 'Créée' },
        { id: 2, certificationCenterName: 'Centre B', displayStatus: 'Créée' },
      ];
      sessions.meta = { rowCount: 2 };
      return sessions;
    }

    test('it should not display selected rows tags and should disable bulk actions when no row is selected', async function (assert) {
      // given
      const sessions = buildSessions();

      // when
      const screen = await render(
        <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
      );

      // then
      assert.dom('.session-list__selected-rows').doesNotExist();
      assert
        .dom(screen.getByRole('button', { name: 'Télécharger les résultats (.csv) des sessions' }))
        .hasAttribute('aria-disabled', 'true');
      assert
        .dom(screen.getByRole('button', { name: 'Télécharger les certificats' }))
        .hasAttribute('aria-disabled', 'true');
    });

    test('it should select a row and display its tag and the bulk actions', async function (assert) {
      // given
      const sessions = buildSessions();
      const screen = await render(
        <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
      );

      // when
      await click(screen.getByRole('checkbox', { name: 'Sélectionner la session 1' }));

      // then
      assert.dom(screen.getByRole('checkbox', { name: 'Sélectionner la session 1' })).isChecked();
      assert.dom('.session-list__selected-rows li').exists({ count: 1 });
      assert.dom(screen.getByRole('button', { name: 'Télécharger les certificats' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Télécharger les résultats (.csv) des sessions' })).exists();
    });

    test('it should deselect a row when clicking its checkbox again', async function (assert) {
      // given
      const sessions = buildSessions();
      const screen = await render(
        <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
      );
      const checkbox = screen.getByRole('checkbox', { name: 'Sélectionner la session 1' });

      // when
      await click(checkbox);
      await click(checkbox);

      // then
      assert.dom(checkbox).isNotChecked();
      assert.dom('.session-list__selected-rows').doesNotExist();
    });

    test('it should remove a row from the selection when removing its tag', async function (assert) {
      // given
      const sessions = buildSessions();
      const screen = await render(
        <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
      );
      await click(screen.getByRole('checkbox', { name: 'Sélection multiple' }));

      // when
      await click('.session-list__selected-rows li:nth-child(1) button');

      // then
      assert.dom('.session-list__selected-rows li').exists({ count: 1 });
      assert.dom(screen.getByRole('checkbox', { name: 'Sélectionner la session 1' })).isNotChecked();
    });

    module('select all checkbox', function () {
      test('it should select all displayed rows when clicking the "select all" checkbox', async function (assert) {
        // given
        const sessions = buildSessions();
        const screen = await render(
          <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
        );

        // when
        await click(screen.getByRole('checkbox', { name: 'Sélection multiple' }));

        // then
        assert.dom(screen.getByRole('checkbox', { name: 'Sélectionner la session 1' })).isChecked();
        assert.dom(screen.getByRole('checkbox', { name: 'Sélectionner la session 2' })).isChecked();
        assert.dom('.session-list__selected-rows li').exists({ count: 2 });
      });

      test('it should clear the selection when clicking the "select all" checkbox while rows are selected', async function (assert) {
        // given
        const sessions = buildSessions();
        const screen = await render(
          <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
        );
        const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Sélection multiple' });

        // when
        await click(selectAllCheckbox);
        await click(selectAllCheckbox);

        // then
        assert.dom('.session-list__selected-rows').doesNotExist();
        assert.dom(screen.getByRole('checkbox', { name: 'Sélectionner la session 1' })).isNotChecked();
      });

      test('the "select all" checkbox is indeterminate when only some rows are selected', async function (assert) {
        // given
        const sessions = buildSessions();
        const screen = await render(
          <template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>,
        );
        const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Sélection multiple' });

        // when
        await click(screen.getByRole('checkbox', { name: 'Sélectionner la session 1' }));

        // then
        assert.dom(selectAllCheckbox).hasClass('pix-checkbox__input--indeterminate');

        // when
        await click(screen.getByRole('checkbox', { name: 'Sélectionner la session 2' }));

        // then
        assert.dom(selectAllCheckbox).doesNotHaveClass('pix-checkbox__input--indeterminate');
        assert.dom(selectAllCheckbox).isChecked();
      });
    });
  });
});
