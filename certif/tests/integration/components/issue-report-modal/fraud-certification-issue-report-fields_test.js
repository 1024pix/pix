import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | issue-report-modal/fraud-certification-issue-report-fields', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should call toggle function on click radio button', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const fraudCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('fraudCategory', fraudCategory);

    // when
    const screen = await renderScreen(hbs`
      <IssueReportModal::FraudCertificationIssueReportFields
        @fraudCategory={{this.fraudCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
      />`);
    await click(screen.getByRole('radio'));

    // then
    assert.ok(toggleOnCategory.calledOnceWith(fraudCategory));
  });

  test('it should show text if category is checked', async function (assert) {
    // given
    this.set('toggleOnCategory', sinon.stub());
    this.set('fraudCategory', { isChecked: true });

    // when
    const screen = await renderScreen(hbs`
        <IssueReportModal::FraudCertificationIssueReportFields
          @fraudCategory={{this.fraudCategory}}
          @toggleOnCategory={{this.toggleOnCategory}}
        />`);
    await click(screen.getByRole('radio'));

    // then
    assert
      .dom(
        screen.getByText(
          'Merci de transmettre le procès-verbal de fraude rempli pendant la session de certification en utilisant'
        )
      )
      .exists();
    assert.dom(screen.getByText('ce formulaire')).exists();
  });
});
