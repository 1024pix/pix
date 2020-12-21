import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';

module('Integration | Component | candidate-information-change-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-candidate-information-change';
  const TEXTAREA_SELECTOR = '#text-area-for-category-candidate-information-change';
  const CHAR_COUNT_SELECTOR = '.candidate-information-change-certification-issue-report-fields-details__char-count';
  const SUBCATEGORY_SELECTOR = '#subcategory-for-category-candidate-information-change';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(candidateInformationChangeCategory));
  });

  test('it should show dropdown menu with subcategories when category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
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
    const candidateInformationChangeCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
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
    const candidateInformationChangeCategory = new RadioButtonCategoryWithDescription({ name: 'CANDIDATE_INFORMATION_CHANGE', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });

});
