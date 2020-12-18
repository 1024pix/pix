import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | connection-or-end-screen-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-connection-or-end-screen';

  test('it should render', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connectionOrEndScreenCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connectionOrEndScreenCategory', connectionOrEndScreenCategory);

    // when
    await render(hbs`
      <ConnectionOrEndScreenCertificationIssueReportFields
        @connectionOrEndScreenCategory={{this.connectionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);

    // then
    const expectedLabel = 'Connexion et fin de test : le candidat a passé les dernières questions, faute de temps';
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
      <ConnectionOrEndScreenCertificationIssueReportFields
        @connectionOrEndScreenCategory={{this.connectionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(connectionOrEndScreenCategory));
  });

});
