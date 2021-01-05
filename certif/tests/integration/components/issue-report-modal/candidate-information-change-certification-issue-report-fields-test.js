import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { RadioButtonCategoryWithDescription } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';
import { certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';

module('Integration | Component | candidate-information-change-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);

  const INPUT_RADIO_SELECTOR = '#input-radio-for-category-candidate-information-change';
  const TEXTAREA_SELECTOR = '#text-area-for-category-candidate-information-change';
  const CHAR_COUNT_SELECTOR = '.candidate-information-change-certification-issue-report-fields-details__char-count';
  const SUBCATEGORY_SELECTOR = '#subcategory-for-category-candidate-information-change';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(candidateInformationChangeCategory));
  });

  test('it should show dropdown menu with subcategories when category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: true };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(SUBCATEGORY_SELECTOR).exists();
    assert.dom(TEXTAREA_SELECTOR).exists();
  });

  test('it should count textarea characters length', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = new RadioButtonCategoryWithDescription({ name: 'CANDIDATE_INFORMATION_CHANGE', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await fillIn(TEXTAREA_SELECTOR, 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });

  test('it should show "Précisez les informations à modifier" if subcategory NAME_OR_BIRTHDATE is selected', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: true, subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(SUBCATEGORY_SELECTOR).exists();
    assert.dom(TEXTAREA_SELECTOR).exists();
    assert.contains('Précisez les informations à modifier');
  });

  test('it should show "Précisez le temps majoré" if subcategory EXTRA_TIME_PERCENTAGE is selected', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: true, subcategory: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    await render(hbs`
      <IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
        @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(INPUT_RADIO_SELECTOR);

    // then
    assert.dom(SUBCATEGORY_SELECTOR).exists();
    assert.dom(TEXTAREA_SELECTOR).exists();
    assert.contains('Précisez le temps majoré');
  });
});
