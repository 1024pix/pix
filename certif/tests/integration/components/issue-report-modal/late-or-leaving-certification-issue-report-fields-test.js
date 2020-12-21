import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';

import sinon from 'sinon';

module('Integration | Component | late-or-leaving-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-late-or-leaving';
  const TEXTAREA_SELECTOR = '#text-area-for-category-late-or-leaving';
  const SUBCATEGORY_SELECTOR = '#subcategory-for-category-late-or-leaving';
  const CHAR_COUNT_SELECTOR = '.late-or-leaving-certification-issue-report-fields-details__char-count';

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

  test('it should not show textarea if category is unchecked', async function(assert) {
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
    assert.dom(TEXTAREA_SELECTOR).doesNotExist();
    assert.dom(SUBCATEGORY_SELECTOR).doesNotExist();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = new RadioButtonCategoryWithDescription({ name: 'LATE_OR_LEAVING', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <IssueReportModal::LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });
});
