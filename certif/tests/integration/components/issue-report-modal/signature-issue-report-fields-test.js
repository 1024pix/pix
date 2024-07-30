import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | signature-issue-report-fields', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should call toggle function on click radio button', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const signatureIssueCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('signatureIssueCategory', signatureIssueCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::SignatureIssueReportFields
  @signatureIssueCategory={{this.signatureIssueCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
/>`);

    await click(screen.getByRole('radio'));

    // then
    assert.ok(toggleOnCategory.calledOnceWith(signatureIssueCategory));
  });

  test('it should show textarea if category is checked', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const updateSignatureIssueCategory = sinon.stub();
    const signatureIssueCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('signatureIssueCategory', signatureIssueCategory);
    this.set('updateSignatureIssueCategory', updateSignatureIssueCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::SignatureIssueReportFields
  @signatureIssueCategory={{this.signatureIssueCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateSignatureIssueCategoryDescription={{this.updateSignatureIssueCategory}}
/>`);
    await click(screen.getByRole('radio'));

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Précisez' })).exists();
  });

  test('it should show "Précisez" if category is checked', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const updateSignatureIssueCategory = sinon.stub();
    const signatureIssueCategory = {
      isChecked: true,
    };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('signatureIssueCategory', signatureIssueCategory);
    this.set('updateSignatureIssueCategory', updateSignatureIssueCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::SignatureIssueReportFields
  @signatureIssueCategory={{this.signatureIssueCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateSignatureIssueCategoryDescription={{this.updateSignatureIssueCategory}}
/>`);
    await click(screen.getByRole('radio'));

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Précisez' })).exists();
  });
});
