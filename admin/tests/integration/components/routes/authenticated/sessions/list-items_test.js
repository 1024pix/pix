import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sessions | list-items', function (hooks) {
  setupRenderingTest(hooks);

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
    const displayedResultsSentToPrescriberAt = resultsSentToPrescriberAt.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    sessions.meta = { rowCount: 2 };
    this.set('sessions', sessions);

    // when
    await render(hbs`<Sessions::ListItems @sessions={{this.sessions}} @triggerFiltering={{this.triggerFiltering}} />`);

    // then
    assert.dom('table tbody tr').exists({ count: sessions.length });
    for (let i = 0; i < sessions.length; ++i) {
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:first-child`).hasText(sessions[i].id.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`).hasText(sessions[i].certificationCenterName);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(5)`)
        .hasText(displayedDate + ' à ' + sessions[i].time);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(6)`).hasText(sessions[i].displayStatus);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(7)`)
        .hasText(sessions[i].finalizedAt ? displayedFinalizedAt : sessions[i].finalizedAt);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(8)`)
        .hasText(sessions[i].publishedAt ? displayedPublishedAt : sessions[i].publishedAt);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(9)`)
        .hasText(
          sessions[i].resultsSentToPrescriberAt
            ? displayedResultsSentToPrescriberAt
            : sessions[i].resultsSentToPrescriberAt
        );
    }
    // Colonne : Centre de certification
    assert.dom('table tbody tr:nth-child(1) td:nth-child(3)').hasText(sessions[0].certificationCenterExternalId);
    assert.dom('table tbody tr:nth-child(1) td:nth-child(4)').hasText(sessions[0].certificationCenterType);
    assert.dom('table tbody tr:nth-child(2) td:nth-child(4)').hasText('-');
  });

  module('Input field for id filtering', function () {
    test('it should render a input field to filter on id', async function (assert) {
      // when
      const screen = await render(hbs`<Sessions::ListItems @triggerFiltering={{this.triggerFiltering}} />`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Filtrer les sessions avec un id' })).exists();
    });
  });

  module('Input field for certificationCenterName filtering', function () {
    test('it should render a input field to filter on certificationCenterName', async function (assert) {
      // when
      const screen = await render(hbs`<Sessions::ListItems @triggerFiltering={{this.triggerFiltering}} />`);

      // then
      assert
        .dom(screen.getByRole('textbox', { name: "Filtrer les sessions avec le nom d'un centre de certification" }))
        .exists();
    });
  });

  module('Dropdown menu for certification center type filtering', function () {
    test('it should render a dropdown menu to filter sessions on their certification center type', async function (assert) {
      // given
      const screen = await render(hbs`<Sessions::ListItems />`);

      // when
      await click(
        screen.getByRole('button', {
          name: 'Filtrer les sessions en sélectionnant un type de centre de certification',
        })
      );
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('option', { name: 'Tous' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Pro' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Sco' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Sup' })).exists();
    });

    test('it should filter sessions on certification center type when it has changed', async function (assert) {
      // given
      this.set('certificationCenterType', 'SCO');
      this.set('updateCertificationCenterTypeFilter', (newValue) => this.set('certificationCenterType', newValue));
      const screen = await render(
        hbs`<Sessions::ListItems
  @certificationCenterType={{this.certificationCenterType}}
  @onChangeCertificationCenterType={{this.updateCertificationCenterTypeFilter}}
/>`
      );

      // when
      await click(
        screen.getByRole('button', {
          name: 'Filtrer les sessions en sélectionnant un type de centre de certification',
        })
      );
      await screen.findByRole('listbox');

      await click(screen.getByRole('option', { name: 'Pro' }));

      // then
      assert.strictEqual(this.certificationCenterType, 'PRO');
    });
  });

  module('Dropdown menu for status filtering', function () {
    test('it should render a dropdown menu to filter sessions on their status', async function (assert) {
      // given
      const screen = await render(hbs`<Sessions::ListItems />`);

      // when
      await click(
        screen.getByRole('button', {
          name: 'Filtrer les sessions en sélectionnant un statut',
        })
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
      this.set('status', 'finalized');
      this.set('updateSessionStatusFilter', (newValue) => this.set('status', newValue));
      const screen = await render(
        hbs`<Sessions::ListItems @status={{this.status}} @onChangeSessionStatus={{this.updateSessionStatusFilter}} />`
      );

      // when
      await click(
        screen.getByRole('button', {
          name: 'Filtrer les sessions en sélectionnant un statut',
        })
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Créée' }));

      // then
      assert.strictEqual(this.status, 'created');
    });
  });

  module('Dropdown menu for resultsSentToPrescriberAt filtering', function () {
    test('it should render a dropdown menu to filter sessions on their results sending', async function (assert) {
      // given
      const screen = await render(hbs`<Sessions::ListItems />`);

      // when
      await click(
        screen.getByRole('button', {
          name: 'Filtrer les sessions par leurs résultats diffusés ou non diffusés',
        })
      );
      await screen.findByRole('listbox');

      // then
      assert.dom(screen.getByRole('option', { name: 'Tous' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Résultats diffusés' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Résultats non diffusés' })).exists();
    });

    test('it should filter sessions on results sending status when it has changed', async function (assert) {
      // given
      this.set('resultsSentToPrescriberAt', 'true');
      this.set('updateSessionResultsSentToPrescriberFilter', (newValue) =>
        this.set('resultsSentToPrescriberAt', newValue)
      );
      const screen = await render(
        hbs`<Sessions::ListItems
  @resultsSentToPrescriberAt={{this.resultsSentToPrescriberAt}}
  @onChangeSessionResultsSent={{this.updateSessionResultsSentToPrescriberFilter}}
/>`
      );

      // when
      await click(
        screen.getByRole('button', {
          name: 'Filtrer les sessions par leurs résultats diffusés ou non diffusés',
        })
      );
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Résultats non diffusés' }));

      // then
      assert.strictEqual(this.resultsSentToPrescriberAt, 'false');
    });
  });
});
