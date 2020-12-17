import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/examiner-report-modal';

module('Integration | Component | candidate-information-change-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-candidate-information-change';
  const TEXTAREA_SELECTOR = '#text-area-for-category-candidate-information-change';
  const CHAR_COUNT_SELECTOR = '.candidate-information-change-certification-issue-report-fields-details__char-count';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(candidateInformationChangeCategory));
  });

  test('it should show textarea if category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.candidate-information-change-certification-issue-report-fields__details').exists();
  });

  test('it should not show textarea if category is unchecked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.candidate-information-change-certification-issue-report-fields__details').doesNotExist();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = new RadioButtonCategoryWithDescription({ name: 'CANDIDATE_INFORMATION_CHANGE', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });

});
