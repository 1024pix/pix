import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';

import sinon from 'sinon';

module('Integration | Component | late-or-leaving-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-late-or-leaving';
  const TEXTAREA_SELECTOR = '#text-area-for-category-late-or-leaving';
  const SUBCATEGORY_SELECTOR = '#subcategory-for-category-late-or-leaving';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <IssueReportModal::LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(lateOrLeavingCategory));
  });

  test('it should show textarea if category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <IssueReportModal::LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(SUBCATEGORY_SELECTOR).exists();
    assert.dom(TEXTAREA_SELECTOR).exists();
  });

  test('it should show "Précisez" if subcategory SIGNATURE_ISSUE is selected', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = { isChecked: true, subcategory: certificationIssueReportSubcategories.SIGNATURE_ISSUE };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <IssueReportModal::LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(SUBCATEGORY_SELECTOR).exists();
    assert.dom(TEXTAREA_SELECTOR).exists();
    assert.contains('Précisez');
  });

  test('it should show "Précisez et indiquez l’heure de sortie" if subcategory LEFT_EXAM_ROOM is selected', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = { isChecked: true, subcategory: certificationIssueReportSubcategories.LEFT_EXAM_ROOM };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <IssueReportModal::LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(SUBCATEGORY_SELECTOR).exists();
    assert.dom(TEXTAREA_SELECTOR).exists();
    assert.contains('Précisez et indiquez l’heure de sortie');
  });
});
