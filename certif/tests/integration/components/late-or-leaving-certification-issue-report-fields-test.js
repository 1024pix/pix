import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | late-or-leaving-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-late-or-leaving';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <LateOrLeavingCertificationIssueReportFields
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
      <LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.late-or-leaving-certification-issue-report-fields__details').exists();
  });

  test('it should not show textarea if category is unchecked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const lateOrLeavingCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('lateOrLeavingCategory', lateOrLeavingCategory);

    // when
    await render(hbs`
      <LateOrLeavingCertificationIssueReportFields
        @lateOrLeavingCategory={{this.lateOrLeavingCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.late-or-leaving-certification-issue-report-fields__details').doesNotExist();
  });

});
