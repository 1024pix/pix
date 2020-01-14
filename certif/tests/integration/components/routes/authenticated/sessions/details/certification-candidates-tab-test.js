import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import _ from 'lodash';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | certification-candidates-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
      this.set('importCertificationCandidatesSpy', () => {});
      this.set('saveCertificationCandidateSpy', () => {});
    });
  });

  test('it should display a download button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy}}`);

    // then
    assert.dom('[data-test-id="attendance_sheet_download_button"]').exists();
    assert.dom('[data-test-id="attendance_sheet_download_button"]').hasText('Télécharger (.ods)');
  });

  test('it should display an upload button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy}}`);

    // then
    assert.dom('[data-test-id="attendance_sheet_upload_button"]').exists();
    assert.dom('[data-test-id="attendance_sheet_upload_button"]').hasText('Importer (.ods)');
  });

  test('it should display the list of certification candidates', async function(assert) {
    // given
    const certificationCandidates = _.map([
      { id: 1, firstName: 'A', lastName: 'B', birthdate: '1990-01-01', birthCity: 'Ville', email: 'a@b.c', birthProvinceCode: 'Dep01', birthCountry: 'Pays', extraTimePercentage: 0.3 },
      { id: 2, firstName: 'C', lastName: 'D', birthdate: '1990-12-25', birthCity: 'LABA', externalId: 'CDLABA' }
    ], (certificationCandidate) => run(() => store.createRecord('certification-candidate', certificationCandidate)));
    this.set('certificationCandidates', certificationCandidates);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy}}`);

    // then
    assert.dom('[data-test-id="panel-candidate__lastName__1"]').hasText('B');
    assert.dom('[data-test-id="panel-candidate__firstName__1"]').hasText('A');
    assert.dom('[data-test-id="panel-candidate__birthdate__1"]').hasText('01/01/1990');
    assert.dom('[data-test-id="panel-candidate__birthCity__1"]').hasText('Ville');
    assert.dom('[data-test-id="panel-candidate__birthProvinceCode__1"]').hasText('Dep01');
    assert.dom('[data-test-id="panel-candidate__birthCountry__1"]').hasText('Pays');
    assert.dom('[data-test-id="panel-candidate__email__1"]').hasText('a@b.c');
    assert.dom('[data-test-id="panel-candidate__externalId__1"]').hasText('');
    assert.dom('[data-test-id="panel-candidate__extraTimePercentage__1"]').hasText('30 %');
    assert.dom('[data-test-id="panel-candidate__lastName__2"]').hasText('D');
    assert.dom('[data-test-id="panel-candidate__firstName__2"]').hasText('C');
    assert.dom('[data-test-id="panel-candidate__birthdate__2"]').hasText('25/12/1990');
    assert.dom('[data-test-id="panel-candidate__birthCity__2"]').hasText('LABA');
    assert.dom('[data-test-id="panel-candidate__birthProvinceCode__2"]').hasText('');
    assert.dom('[data-test-id="panel-candidate__birthCountry__2"]').hasText('');
    assert.dom('[data-test-id="panel-candidate__email__2"]').hasText('');
    assert.dom('[data-test-id="panel-candidate__externalId__2"]').hasText('CDLABA');
    assert.dom('[data-test-id="panel-candidate__extraTimePercentage__2"]').hasText('');
  });

  test('it should display a sentence when there is no certification candidates yet', async function(assert) {
    // given
    this.set('certificationCandidates', []);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy}}`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de candidats');
  });

  test('it should display a warning when the import is not allowed', async function(assert) {
    // given
    this.set('certificationCandidates', []);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=false importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy}}`);

    // then
    assert.dom('.panel-actions__warning strong').hasText(
      'La session a débuté, il n\'est plus possible de modifier la liste des candidats.'
    );
  });

  test('it should display a "Ajouter un candidat" button', async function(assert) {
    // given
    this.set('certificationCandidates', []);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=false importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy}}`);

    // then
    assert.dom('.certification-candidates-add-button__text').hasText('Ajouter un candidat');
  });

  module('when adding a candidate in staging for saving', () => {

    test('it should add a new line when we click on "Ajouter un candidat" button', async function(assert) {
      // given
      const certificationCandidates = run(() => store.createRecord('certification-candidate', { id: 1, firstName: 'A', lastName: 'B', birthdate: '1990-01-01', birthCity: 'Ville', email: 'a@b.c', birthProvinceCode: 'Dep01', birthCountry: 'Pays', extraTimePercentage: 0.3 }));
      this.set('certificationCandidates', certificationCandidates);

      // when
      await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=false importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy session=session}}`);
      await click('[data-test-id="add-certification-candidate-staging__button"]');

      // then
      assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
    });

    test('it should remove the line when clicking on cancel button', async function(assert) {
      // given
      const certificationCandidates = run(() => store.createRecord('certification-candidate', { id: 1, firstName: 'A', lastName: 'B', birthdate: '1990-01-01', birthCity: 'Ville', email: 'a@b.c', birthProvinceCode: 'Dep01', birthCountry: 'Pays', extraTimePercentage: 0.3 }));
      this.set('certificationCandidates', certificationCandidates);

      // when
      await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=false importCertificationCandidates=importCertificationCandidatesSpy saveCertificationCandidate=saveCertificationCandidateSpy session=session}}`);

      // then
      await click('[data-test-id="add-certification-candidate-staging__button"]');
      assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').exists();
      await click('[data-test-id="panel-candidate__action__cancel"]');
      assert.dom('[data-test-id="panel-candidate__lastName__add-staging"]').doesNotExist();
    });
  });

});
