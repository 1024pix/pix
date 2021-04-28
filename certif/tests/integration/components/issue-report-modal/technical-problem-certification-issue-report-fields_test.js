import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | issue-report-modal/technical-problem-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-technical-problem';

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
});
