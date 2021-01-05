import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | issue-report-modal/fraud-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-fraud';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const fraudCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('fraudCategory', fraudCategory);

    // when
    await render(hbs`
      <IssueReportModal::FraudCertificationIssueReportFields
        @fraudCategory={{this.fraudCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(fraudCategory));
  });

  test('it should show text if category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const fraudCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('fraudCategory', fraudCategory);

    // when
    await render(hbs`
      <IssueReportModal::FraudCertificationIssueReportFields
        @fraudCategory={{this.fraudCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.contains('Merci de joindre le procès-verbal de fraude rempli pendant la session de certification en utilisant le formulaire 123formbuilder accessible à l\'étape suivante de cette finalisation de session.');
  });
});
