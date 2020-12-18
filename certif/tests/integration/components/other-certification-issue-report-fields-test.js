import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/add-issue-report-modal';
import sinon from 'sinon';

module('Integration | Component | other-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-other';
  const TEXTAREA_SELECTOR = '#text-area-for-category-other';
  const CHAR_COUNT_SELECTOR = '.other-certification-issue-report-fields-details__char-count';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const otherCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('otherCategory', otherCategory);

    // when
    await render(hbs`
      <OtherCertificationIssueReportFields
        @otherCategory={{this.otherCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(otherCategory));
  });

  test('it should show textarea if category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const otherCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('otherCategory', otherCategory);

    // when
    await render(hbs`
      <OtherCertificationIssueReportFields
        @otherCategory={{this.otherCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.other-certification-issue-report-fields__details').exists();
  });

  test('it should not show textarea if category is unchecked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const otherCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('otherCategory', otherCategory);

    // when
    await render(hbs`
      <OtherCertificationIssueReportFields
        @otherCategory={{this.otherCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.other-certification-issue-report-fields__details').doesNotExist();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const otherCategory = new RadioButtonCategoryWithDescription({ name: 'OTHER', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('otherCategory', otherCategory);

    // when
    await render(hbs`
      <OtherCertificationIssueReportFields
        @otherCategory={{this.otherCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });
});
