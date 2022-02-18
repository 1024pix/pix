import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certifications/list', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('should display many certifications ordered by the most issues with required action count', async function (assert) {
    // given
    this.certifications = [
      store.createRecord('jury-certification-summary', {
        id: 1,
        numberOfCertificationIssueReportsWithRequiredActionLabel: 1,
      }),
      store.createRecord('jury-certification-summary', {
        id: 2,
        numberOfCertificationIssueReportsWithRequiredActionLabel: 3,
      }),
      store.createRecord('jury-certification-summary', {
        id: 3,
        numberOfCertificationIssueReportsWithRequiredActionLabel: 2,
      }),
    ];

    // when
    await render(hbs`<Certifications::List @certifications={{certifications}} />`);

    const tableRows = findAll('tbody > tr');
    assert.strictEqual(tableRows.length, 3);
    const firstRow = 'tbody > tr:nth-child(1)';
    const unresolvedImpactfulIssuesColumn = 'td:nth-child(5)';
    assert.strictEqual(find(firstRow + ' > ' + unresolvedImpactfulIssuesColumn).innerText, '3');
    const secondRow = 'tbody > tr:nth-child(2)';
    assert.strictEqual(find(secondRow + ' > ' + unresolvedImpactfulIssuesColumn).innerText, '2');
    const thirdRow = 'tbody > tr:nth-child(3)';
    assert.strictEqual(find(thirdRow + ' > ' + unresolvedImpactfulIssuesColumn).innerText, '1');
  });

  test('should display number of certification issue reports with required action', async function (assert) {
    // given
    this.certifications = [
      store.createRecord('jury-certification-summary', {
        id: 1,
        numberOfCertificationIssueReportsWithRequiredActionLabel: 2,
      }),
    ];

    // when
    await render(hbs`<Certifications::List @certifications={{certifications}} />`);

    const numberOfCertificationIssueReportsWithRequiredAction =
      this.element.querySelector('tbody > tr td:nth-child(5)');
    assert.dom(numberOfCertificationIssueReportsWithRequiredAction).hasText('2');
  });

  test('should display the complementary certifications if any', async function (assert) {
    // given
    const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
      cleaCertificationStatus: 'taken',
      pixPlusDroitMaitreCertificationStatus: 'taken',
      pixPlusDroitExpertCertificationStatus: 'not_taken',
    });
    this.certifications = [juryCertificationSummaryProcessed];

    // when
    await render(hbs`<Certifications::List @certifications={{certifications}} />`);

    // then
    assert.contains('CléA Numérique Pix+ Droit Maître');
  });

  module('when displayHasSeenEndTestScreenColumn is true', function () {
    test('it should display the "Ecran de fin de test vu" column', async function (assert) {
      // given
      const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
        hasSeenEndTestScreen: true,
      });
      this.certifications = [juryCertificationSummaryProcessed];

      // when
      await render(
        hbs`<Certifications::List @certifications={{certifications}} @displayHasSeenEndTestScreenColumn={{true}}/>`
      );

      // then
      assert.contains('Ecran de fin de test vu');
    });
  });

  module('when displayHasSeenEndTestScreenColumn is false', function () {
    test('it should not display the "Ecran de fin de test vu" column', async function (assert) {
      // given
      const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
        hasSeenEndTestScreen: true,
      });
      this.certifications = [juryCertificationSummaryProcessed];

      // when
      await render(
        hbs`<Certifications::List @certifications={{certifications}} @displayHasSeenEndTestScreenColumn={{false}}/>`
      );

      // then
      assert.notContains('Ecran de fin de test vu');
    });
  });
});
