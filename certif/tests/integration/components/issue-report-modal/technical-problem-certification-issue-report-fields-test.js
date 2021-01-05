import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';
import sinon from 'sinon';

module('Integration | Component | issue-report-modal/technical-problem-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-technical-problem';
  const TEXTAREA_SELECTOR = '#text-area-for-category-technical-problem';
  const CHAR_COUNT_SELECTOR = '.technical-problem-certification-issue-report-fields-details__char-count';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const technicalProblemCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('technicalProblemCategory', technicalProblemCategory);

    // when
    await render(hbs`
      <IssueReportModal::TechnicalProblemCertificationIssueReportFields
        @technicalProblemCategory={{this.technicalProblemCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(technicalProblemCategory));
  });

  test('it should show textarea if category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const technicalProblemCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('technicalProblemCategory', technicalProblemCategory);

    // when
    await render(hbs`
      <IssueReportModal::TechnicalProblemCertificationIssueReportFields
        @technicalProblemCategory={{this.technicalProblemCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.technical-problem-certification-issue-report-fields__details').exists();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const technicalProblemCategory = new RadioButtonCategoryWithDescription({ name: 'TECHNICAL_PROBLEM', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('technicalProblemCategory', technicalProblemCategory);

    // when
    await render(hbs`
      <IssueReportModal::TechnicalProblemCertificationIssueReportFields
        @technicalProblemCategory={{this.technicalProblemCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });
});
