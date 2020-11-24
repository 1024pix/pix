import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sessions | list-items', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display sessions list', async function(assert) {
    // given
    const date = new Date();
    const finalizedAt = new Date('2020-08-14T00:00:00Z');
    const publishedAt = new Date('2020-06-14T00:00:00Z');
    const resultsSentToPrescriberAt = new Date('2020-08-15T00:00:00Z');
    const displayStatus = 'SomeStatus';
    const sessions = [
      { id: 1, certificationCenterName: 'Centre A', certificationCenterType: 'SUP', date, time: '14:00:00',
        displayStatus, finalizedAt: '', publishedAt: '', resultsSentToPrescriberAt: '',
      },
      { id: 2, certificationCenterName: 'Centre B', certificationCenterType: null, date, time: '14:00:00',
        displayStatus, finalizedAt, publishedAt, resultsSentToPrescriberAt,
        assignedCertificationOfficer: { fullName: 'Harry Patter ' },
      },
    ];
    const displayedDate = date.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayedFinalizedAt = finalizedAt.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayedPublishedAt = publishedAt.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayedResultsSentToPrescriberAt = resultsSentToPrescriberAt.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });

    sessions.meta = { rowCount: 2 };
    this.set('sessions', sessions);

    // when
    await render(hbs`<Sessions::ListItems @sessions={{this.sessions}} @triggerFiltering={{this.triggerFiltering}} />`);

    // then
    assert.dom('table tbody tr').exists({ count: sessions.length });
    for (let i = 0; i < sessions.length; ++i) {
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:first-child`).hasText(sessions[i].id.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`).hasText(sessions[i].certificationCenterName);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(4)`).hasText(displayedDate + ' à ' + sessions[i].time);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(5)`).hasText(sessions[i].displayStatus);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(6)`).hasText(sessions[i].finalizedAt ? displayedFinalizedAt : sessions[i].finalizedAt);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(7)`).hasText(sessions[i].publishedAt ? displayedPublishedAt : sessions[i].publishedAt);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(8)`).hasText(sessions[i].resultsSentToPrescriberAt ? displayedResultsSentToPrescriberAt : sessions[i].resultsSentToPrescriberAt);
    }
    // Colonne : Centre de certification
    assert.dom('table tbody tr:nth-child(1) td:nth-child(3)').hasText(sessions[0].certificationCenterType);
    assert.dom('table tbody tr:nth-child(2) td:nth-child(3)').hasText('-');
    // Colonne : Qui ?
    assert.dom('table tbody tr:nth-child(1) td:nth-child(9)').hasText('-');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(9)').hasText(sessions[1].assignedCertificationOfficer.fullName);
  });

  module('Input field for id filtering', function() {

    test('it should render a input field to filter on id', async function(assert) {
      // when
      await render(hbs`<Sessions::ListItems @triggerFiltering={{this.triggerFiltering}} />`);

      // then
      assert.dom('table thead tr:nth-child(2) th:nth-child(1) input').exists();
    });
  });

  module('Input field for certificationCenterName filtering', function() {

    test('it should render a input field to filter on certificationCenterName', async function(assert) {
      // when
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering}}`);
      await render(hbs`<Sessions::ListItems @triggerFiltering={{this.triggerFiltering}} />`);

      // then
      assert.dom('table thead tr:nth-child(2) th:nth-child(2) input').exists();
    });
  });

  module('Dropdown menu for certification center type filtering', function() {

    test('it should render a dropdown menu to filter sessions on their certification center type', async function(assert) {
      // given
      const expectedOptions = [
        { value: 'all', label: 'Tous' },
        { value: 'SCO', label: 'Sco' },
        { value: 'SUP', label: 'Sup' },
        { value: 'PRO', label: 'Pro' },
      ];

      // when
      await render(hbs`<Sessions::ListItems />`);

      // then
      const elementOptions = this.element.querySelectorAll('.certification-center-type-selector > option');
      assert.equal(elementOptions.length, 4);
      elementOptions.forEach((elementOption, index) => {
        const expectedOption = expectedOptions[index];
        assert.dom(elementOption).hasText(expectedOption.label);
        assert.dom(elementOption).hasValue(expectedOption.value);
      });
    });

    test('it should filter sessions on certification center type when it has changed', async function(assert) {
      // given
      this.set('certificationCenterType', 'SCO');
      this.set('updateCertificationCenterTypeFilter', (newValue) => (this.set('certificationCenterType', newValue)));
      await render(hbs`<Sessions::ListItems @certificationCenterType={{this.certificationCenterType}} @onChangeCertificationCenterType={{this.updateCertificationCenterTypeFilter}}/>`);

      // when
      await fillIn('.certification-center-type-selector', 'PRO');

      // then
      assert.equal(this.certificationCenterType, 'PRO');
    });
  });

  module('Dropdown menu for status filtering', function() {

    test('it should render a dropdown menu to filter sessions on their status', async function(assert) {
      // given
      const expectedOptions = [
        { value: 'all', label: 'Tous' },
        { value: 'created', label: 'Créée' },
        { value: 'finalized', label: 'Finalisée' },
        { value: 'in_process', label: 'En cours de traitement' },
        { value: 'processed', label: 'Résultats transmis par Pix' },
      ];

      // when
      await render(hbs`<Sessions::ListItems />`);

      // then
      const elementOptions = this.element.querySelectorAll('.session-status-selector > option');
      assert.equal(elementOptions.length, 5);
      elementOptions.forEach((elementOption, index) => {
        const expectedOption = expectedOptions[index];
        assert.dom(elementOption).hasText(expectedOption.label);
        assert.dom(elementOption).hasValue(expectedOption.value);
      });
    });

    test('it should filter sessions on (session) "status" when it has changed', async function(assert) {
      // given
      this.set('status', 'finalized');
      this.set('updateSessionStatusFilter', (newValue) => (this.set('status', newValue)));
      await render(hbs`<Sessions::ListItems @status={{this.status}} @onChangeSessionStatus={{this.updateSessionStatusFilter}}/>`);

      // when
      await fillIn('.session-status-selector', 'created');

      // then
      assert.equal(this.status, 'created');
    });
  });

  module('Dropdown menu for resultsSentToPrescriberAt filtering', function() {

    test('it should render a dropdown menu to filter sessions on their results sending', async function(assert) {
      // given
      const expectedOptions = [
        { value: 'all', label: 'Tous' },
        { value: 'true', label: 'Résultats diffusés' },
        { value: 'false', label: 'Résultats non diffusés' },
      ];

      // when
      await render(hbs`<Sessions::ListItems />`);

      // then
      const elementOptions = this.element.querySelectorAll('.results-status-selector > option');
      assert.equal(elementOptions.length, 3);
      elementOptions.forEach((elementOption, index) => {
        const expectedOption = expectedOptions[index];
        assert.dom(elementOption).hasText(expectedOption.label);
        assert.dom(elementOption).hasValue(expectedOption.value);
      });
    });

    test('it should filter sessions on results sending status when it has changed', async function(assert) {
      // given
      this.set('resultsSentToPrescriberAt', 'true');
      this.set('updateSessionResultsSentToPrescriberFilter', (newValue) => (this.set('resultsSentToPrescriberAt', newValue)));
      await render(hbs`<Sessions::ListItems @resultsSentToPrescriberAt={{this.resultsSentToPrescriberAt}} @onChangeSessionResultsSent={{this.updateSessionResultsSentToPrescriberFilter}}/>`);

      // when
      await fillIn('.results-status-selector', 'false');

      // then
      assert.equal(this.resultsSentToPrescriberAt, 'false');
    });
  });

});
