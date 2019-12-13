import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
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
    });
  });

  test('it should display the list of certification candidates', async function(assert) {
    // given
    const certificationCandidates = _.map([
      { firstName: 'A', lastName: 'B', birthdate: '1990-01-01', birthCity: 'Ville', email: 'a@b.c', birthProvinceCode: 'Dep01', birthCountry: 'Pays', extraTimePercentage: 0.3 },
      { firstName: 'C', lastName: 'D', birthdate: '1990-12-25', birthCity: 'LABA', externalId: 'CDLABA' }
    ], (certificationCandidate) => run(() => store.createRecord('certification-candidate', certificationCandidate)));
    this.set('certificationCandidates', certificationCandidates);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy}}`);

    // then
    assert.dom('[data-test-id="panel-candidate__lastName"]').hasText('B');
    assert.dom('[data-test-id="panel-candidate__firstName"]').hasText('A');
    assert.dom('[data-test-id="panel-candidate__birthdate"]').hasText('01/01/1990');
    assert.dom('[data-test-id="panel-candidate__birthCity"]').hasText('Ville');
    assert.dom('[data-test-id="panel-candidate__birthProvinceCode"]').hasText('Dep01');
    assert.dom('[data-test-id="panel-candidate__birthCountry"]').hasText('Pays');
    assert.dom('[data-test-id="panel-candidate__email"]').hasText('a@b.c');
    assert.dom('[data-test-id="panel-candidate__externalId"]').hasText('');
    assert.dom('[data-test-id="panel-candidate__extraTimePercentage"]').hasText('30 %');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__lastName"]').hasText('D');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__firstName"]').hasText('C');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__birthdate"]').hasText('25/12/1990');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__birthCity"]').hasText('LABA');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__birthProvinceCode"]').hasText('');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__birthCountry"]').hasText('');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__email"]').hasText('');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__externalId"]').hasText('CDLABA');
    assert.dom('tr:nth-child(2) [data-test-id="panel-candidate__extraTimePercentage"]').hasText('');
  });

  test('it should display a sentence when there is no certification candidates yet', async function(assert) {
    // given
    this.set('certificationCandidates', []);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy}}`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de candidats');
  });

  test('it should display a warning when the import is not allowed', async function(assert) {
    // given
    this.set('certificationCandidates', []);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=false importCertificationCandidates=importCertificationCandidatesSpy}}`);

    // then
    assert.equal(find('.panel-actions__warning strong').textContent.trim(),
      'La session a débuté, il n\'est plus possible de modifier la liste des candidats.');
  });

});
