import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/examiner-report-modal';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | connexion-or-end-screen-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-connexion-or-end-screen';
  const TEXTAREA_SELECTOR = '#text-area-for-category-connexion-or-end-screen';
  const CHAR_COUNT_SELECTOR = '.connexion-or-end-screen-certification-issue-report-fields-details__char-count';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connexionOrEndScreenCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connexionOrEndScreenCategory', connexionOrEndScreenCategory);

    // when
    await render(hbs`
      <ConnexionOrEndScreenCertificationIssueReportFields
        @connexionOrEndScreenCategory={{this.connexionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(connexionOrEndScreenCategory));
  });

  test('it should show textarea if category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connexionOrEndScreenCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connexionOrEndScreenCategory', connexionOrEndScreenCategory);

    // when
    await render(hbs`
      <ConnexionOrEndScreenCertificationIssueReportFields
        @connexionOrEndScreenCategory={{this.connexionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.connexion-or-end-screen-certification-issue-report-fields__details').exists();
  });

  test('it should not show textarea if category is unchecked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connexionOrEndScreenCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connexionOrEndScreenCategory', connexionOrEndScreenCategory);

    // when
    await render(hbs`
      <ConnexionOrEndScreenCertificationIssueReportFields
        @connexionOrEndScreenCategory={{this.connexionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom('.connexion-or-end-screen-certification-issue-report-fields__details').doesNotExist();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const connexionOrEndScreenCategory = new RadioButtonCategoryWithDescription({ name: 'CONNEXION_OR_END_SCREEN', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('connexionOrEndScreenCategory', connexionOrEndScreenCategory);

    // when
    await render(hbs`
      <ConnexionOrEndScreenCertificationIssueReportFields
        @connexionOrEndScreenCategory={{this.connexionOrEndScreenCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6   / 500');
  });

});
