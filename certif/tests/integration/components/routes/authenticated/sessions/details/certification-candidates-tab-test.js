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
      { firstName: 'A', lastName: 'B', birthdate: '1990-01-01', birthCity: 'Ville', birthProvinceCode: 'Dep01', birthCountry: 'Pays', extraTimePercentage: 0.3 },
      { firstName: 'C', lastName: 'D', birthdate: '1990-12-25', birthCity: 'LABA', externalId: 'CDLABA' }
    ], (certificationCandidate) => run(() => store.createRecord('certification-candidate', certificationCandidate)));
    this.set('certificationCandidates', certificationCandidates);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates importAllowed=true importCertificationCandidates=importCertificationCandidatesSpy}}`);

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('B');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('A');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('01/01/1990');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('Ville');
    assert.dom('table tbody tr:first-child td:nth-child(5)').hasText('Dep01');
    assert.dom('table tbody tr:first-child td:nth-child(6)').hasText('Pays');
    assert.dom('table tbody tr:first-child td:nth-child(7)').hasText('');
    assert.dom('table tbody tr:first-child td:nth-child(8)').hasText('30 %');
    assert.dom('table tbody tr:nth-child(2) td:first-child').hasText('D');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(2)').hasText('C');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(3)').hasText('25/12/1990');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(4)').hasText('LABA');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(5)').hasText('');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(6)').hasText('');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(7)').hasText('CDLABA');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(8)').hasText('');
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
    assert.equal(find('.panel-actions__warning b').textContent.trim(),
      'La session a débuté, il n\'est plus possible de modifier la liste dans candidats en utilisant l\'import du PV de session.');
  });

});
