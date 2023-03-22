import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | signature-issue-report-fields', function (hooks) {
  setupIntlRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-signature-issue';
  const TEXTAREA_SELECTOR = '#text-area-for-category-signature-issue';

  test('it should call toggle function on click radio button', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const signatureIssueCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('signatureIssueCategory', signatureIssueCategory);

    // when
    await render(hbs`
      <IssueReportModal::SignatureIssueReportFields
        @signatureIssueCategory={{this.signatureIssueCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(signatureIssueCategory));
  });

  test('it should show textarea if category is checked', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const signatureIssueCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('signatureIssueCategory', signatureIssueCategory);

    // when
    await render(hbs`
      <IssueReportModal::SignatureIssueReportFields
        @signatureIssueCategory={{this.signatureIssueCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(TEXTAREA_SELECTOR).exists();
  });

  test('it should show "Précisez" if category is checked', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const signatureIssueCategory = {
      isChecked: true,
    };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('signatureIssueCategory', signatureIssueCategory);

    // when
    await render(hbs`
      <IssueReportModal::SignatureIssueReportFields
        @signatureIssueCategory={{this.signatureIssueCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(TEXTAREA_SELECTOR).exists();
    assert.contains('Précisez');
  });
});
