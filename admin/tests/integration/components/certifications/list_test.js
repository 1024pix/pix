import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certifications/list', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('should display many certifications', async function (assert) {
    // given
    this.certifications = [
      store.createRecord('jury-certification-summary', { id: 1 }),
      store.createRecord('jury-certification-summary', { id: 2 }),
      store.createRecord('jury-certification-summary', { id: 3 }),
    ];

    // when
    await render(hbs`<Certifications::List @certifications={{certifications}} />`);

    const $tableRows = this.element.querySelectorAll('tbody > tr');
    assert.strictEqual($tableRows.length, 3);
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
