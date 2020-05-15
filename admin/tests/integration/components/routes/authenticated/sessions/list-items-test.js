import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import XSelectInteractor from 'emberx-select/test-support/interactor';

module('Integration | Component | routes/authenticated/sessions | list-items', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const triggerFiltering = { perform: sinon.stub() };
    this.set('triggerFiltering', triggerFiltering);
  });

  test('it should display sessions list', async function(assert) {
    // given
    const now = new Date();
    const displayDate = now.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayStatus = 'SomeStatus';
    const sessions = [
      { id: 1, certificationCenterName: 'Centre A', certificationCenterType: 'SUP', date: now, time: '14:00:00',
        displayDate, displayStatus, displayFinalizationDate: '',
        displayPublishedAtDate: '', displayResultsSentToPrescriberDate: '',
      },
      { id: 2, certificationCenterName: 'Centre B', certificationCenterType: null, date: now, time: '14:00:00',
        displayDate, displayStatus, displayFinalizationDate: 'SomeFDate',
        displayPublishedAtDate: 'SomePDate', displayResultsSentToPrescriberDate: 'SomeRDate',
        assignedCertificationOfficer: { fullName: 'Harry Patter ' },
      },
    ];

    sessions.meta = { rowCount: 2 };
    this.set('sessions', sessions);

    // when
    await render(hbs`{{sessions/list-items sessions=sessions triggerFiltering=triggerFiltering}}`);

    // then
    assert.dom('table tbody tr').exists({ count: sessions.length });
    for (let i = 0; i < sessions.length; ++i) {
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:first-child`).hasText(sessions[i].id.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`).hasText(sessions[i].certificationCenterName);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(4)`).hasText(displayDate + ' à ' + sessions[i].time);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(5)`).hasText(sessions[i].displayStatus);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(6)`).hasText(sessions[i].displayFinalizationDate);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(7)`).hasText(sessions[i].displayPublishedAtDate);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(8)`).hasText(sessions[i].displayResultsSentToPrescriberDate);
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
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering}}`);

      // then
      assert.dom('table thead tr:nth-child(2) th:nth-child(1) input').exists();
    });
  });

  module('Input field for certificationCenterName filtering', function() {

    test('it should render a input field to filter on certificationCenterName', async function(assert) {
      // when
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering}}`);

      // then
      assert.dom('table thead tr:nth-child(2) th:nth-child(2) input').exists();
    });
  });

  module('Dropdown menu for status filtering', function(hooks) {

    hooks.beforeEach(function() {
      const statusList = [
        { status: 'status1', label: 'label1' },
        { status: 'status2', label: 'label2' },
        { status: 'status3', label: 'label3' },
      ];
      this.set('sessionStatusAndLabels', statusList);
    });

    test('it should render a dropdown menu to filter on status', async function(assert) {
      // when
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering sessionStatusAndLabels=sessionStatusAndLabels}}`);

      // then
      const option1 = find('table thead tr:nth-child(2) th:nth-child(5) select option:nth-child(1)');
      assert.dom(option1).hasText('label1');
    });

    test('it should call triggerFiltering task for the status field', async function(assert) {
      // given
      const xselect = new XSelectInteractor('#status');
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering sessionStatusAndLabels=sessionStatusAndLabels}}`);

      // when
      await xselect.select('label3').when(() => {
        sinon.assert.calledWith(this.get('triggerFiltering').perform, 'status', 'status3');
        assert.equal(xselect.options(2).isSelected, true);
      });
    });
  });

  module('Dropdown menu for resultsSentToPrescriberAt filtering', function(hooks) {

    hooks.beforeEach(function() {
      const statusList = [
        { value: 'value1', label: 'label1' },
        { value: 'value2', label: 'label2' },
        { value: 'value3', label: 'label3' },
      ];
      this.set('sessionResultsSentToPrescriberAtAndLabels', statusList);
    });

    test('it should render a dropdown menu to filter on resultsSentToPrescriberAt', async function(assert) {
      // when
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering sessionResultsSentToPrescriberAtAndLabels=sessionResultsSentToPrescriberAtAndLabels}}`);

      // then
      const option1 = find('table thead tr:nth-child(2) th:nth-child(8) select option:nth-child(1)');
      assert.dom(option1).hasText('label1');
    });

    test('it should call triggerFiltering task for resultsSentToPrescriberAt field', async function(assert) {
      // given
      const xselect = new XSelectInteractor('#resultsSentToPrescriberAt');
      await render(hbs`{{sessions/list-items triggerFiltering=triggerFiltering sessionResultsSentToPrescriberAtAndLabels=sessionResultsSentToPrescriberAtAndLabels}}`);

      // when
      await xselect.select('label3').when(() => {
        sinon.assert.calledWith(this.get('triggerFiltering').perform, 'resultsSentToPrescriberAt', 'value3');
        assert.equal(xselect.options(2).isSelected, true);
      });
    });
  });

});
