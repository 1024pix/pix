import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | CertificationList', function(hooks) {

  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  test('should display many certifications', async function(assert) {
    // given
    this.certifications = [
      EmberObject.create({ id: 1 }),
      EmberObject.create({ id: 2 }),
      EmberObject.create({ id: 3 }),
    ];

    // when
    await render(hbs`<Certification::CertificationList @certifications={{certifications}} />`);

    const $tableRows = this.element.querySelectorAll('tbody > tr');
    assert.equal($tableRows.length, 3);
  });

  test('should display number of certification issue reports with required action', async function(assert) {
    // given
    this.certifications = [
      EmberObject.create({ id: 1, numberOfCertificationIssueReportsWithRequiredActionLabel: 2 }),
    ];

    // when
    await render(hbs`<Certification::CertificationList @certifications={{certifications}} />`);

    const numberOfCertificationIssueReportsWithRequiredAction = this.element.querySelector('tbody > tr td:nth-child(5)');
    assert.dom(numberOfCertificationIssueReportsWithRequiredAction).hasText('2');
  });

  test('should display the complementary certifications if any', async function(assert) {
    // given
    const juryCertificationSummaryProcessed = run(() => {
      return store.createRecord('jury-certification-summary', {
        cleaCertificationStatus: 'taken',
        pixPlusDroitMaitreCertificationStatus: 'taken',
        pixPlusDroitExpertCertificationStatus: 'not_taken',
      });
    });
    this.certifications = [juryCertificationSummaryProcessed];

    // when
    await render(hbs`<Certification::CertificationList @certifications={{certifications}} />`);

    // then
    assert.contains('CléA Numérique\nPix+ Droit Maître');
  });
});
