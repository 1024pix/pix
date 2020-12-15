import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | other-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-other';
  const TEXTAREA_SELECTOR = '#text-area-for-category-other';
  const CHAR_COUNT_SELECTOR = '.other-certification-issue-report-fields-details__char-count';

  test('it should show textearea when clicking on radio button', async function(assert) {
    // given
    const toggleOnCategory = (otherCategory) => {
      otherCategory.isChecked = !otherCategory.isChecked;
    };
    this.set('toggleOnCategory', toggleOnCategory);

    // when
    await render(hbs`
      <OtherCertificationIssueReportFields
        @toggleOnCategory={{this.toggleOnCategory}}
        @currentIssueReport={{null}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.other-certification-issue-report-fields__details').exists();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = (otherCategory) => {
      otherCategory.isChecked = !otherCategory.isChecked;
    };
    this.set('toggleOnCategory', toggleOnCategory);

    // when
    await render(hbs`
      <OtherCertificationIssueReportFields
        @toggleOnCategory={{this.toggleOnCategory}}
        @currentIssueReport={{null}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });
});
