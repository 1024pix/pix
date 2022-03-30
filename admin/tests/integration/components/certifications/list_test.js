import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certifications/list', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
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
    const screen = await render(hbs`<Certifications::List @certifications={{certifications}} />`);

    // then
    assert.dom(screen.getByText('CléA Numérique Pix+ Droit Maître', { exact: false })).exists();
  });

  module('when displayHasSeenEndTestScreenColumn is true', function () {
    test('it should display the "Ecran de fin de test vu" column', async function (assert) {
      // given
      const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
        hasSeenEndTestScreen: true,
      });
      this.certifications = [juryCertificationSummaryProcessed];

      // when
      const screen = await render(
        hbs`<Certifications::List @certifications={{certifications}} @displayHasSeenEndTestScreenColumn={{true}}/>`
      );

      // then
      assert.dom(screen.getByLabelText('Ecran de fin de test vu')).exists();
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
      const screen = await render(
        hbs`<Certifications::List @certifications={{certifications}} @displayHasSeenEndTestScreenColumn={{false}}/>`
      );

      // then
      assert.dom(screen.queryByText('Ecran de fin de test vu')).doesNotExist();
    });
  });
});
