import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import _ from 'lodash';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | certification-candidates-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
      this.set('uploadCertificationCandidatesSpy', () => {});
    });
  });

  test('it should display the list of certification candidates', async function(assert) {
    // given
    const certificationCandidates = _.map([
      { firstName: 'A', lastName: 'B', birthdate: '1990-01-01', birthplace: 'ICI', extraTimePercentage: 0.3 },
      { firstName: 'C', lastName: 'D', birthdate: '1990-12-25', birthplace: 'LABA', externalId: 'CDLABA' }
    ], (certificationCandidate) => run(() => store.createRecord('certification-candidate', certificationCandidate)));
    this.set('certificationCandidates', certificationCandidates);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates uploadCertificationCandidates=uploadCertificationCandidatesSpy}}`);

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('B');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('A');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('01/01/1990');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('ICI');
    assert.dom('table tbody tr:first-child td:nth-child(5)').hasText('');
    assert.dom('table tbody tr:first-child td:nth-child(6)').hasText('30 %');
    assert.dom('table tbody tr:nth-child(2) td:first-child').hasText('D');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(2)').hasText('C');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(3)').hasText('25/12/1990');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(4)').hasText('LABA');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(5)').hasText('CDLABA');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(6)').hasText('');
  });

  test('it should display a sentence when there is no certification candidates yet', async function(assert) {
    // given
    this.set('certificationCandidates', []);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/certification-candidates-tab certificationCandidates=certificationCandidates uploadCertificationCandidates=uploadCertificationCandidatesSpy}}`);

    // then
    assert.dom('table tbody').doesNotExist();
    assert.dom('.table__empty').hasText('En attente de candidats');
  });

});
