import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { certificationIssueReportCategories, categoryToLabel } from 'pix-certif/models/certification-issue-report';

module('Integration | Component | connection-or-end-screen-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-connection-or-end-screen';

  test('it should render', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connectionOrEndScreenCategory = {
      isChecked: false,
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CONNECTION_OR_END_SCREEN],
    };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connectionOrEndScreenCategory', connectionOrEndScreenCategory);

    // when
    await render(hbs`
      <IssueReportModal::ConnectionOrEndScreenCertificationIssueReportFields
        @connectionOrEndScreenCategory={{this.connectionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);

    // then
    const expectedLabel = categoryToLabel[certificationIssueReportCategories.CONNECTION_OR_END_SCREEN];
    assert.contains(expectedLabel);
  });

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connectionOrEndScreenCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connectionOrEndScreenCategory', connectionOrEndScreenCategory);

    // when
    await render(hbs`
      <IssueReportModal::ConnectionOrEndScreenCertificationIssueReportFields
        @connectionOrEndScreenCategory={{this.connectionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(connectionOrEndScreenCategory));
  });

});
