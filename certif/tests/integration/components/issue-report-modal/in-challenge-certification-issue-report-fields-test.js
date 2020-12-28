import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import {
  certificationIssueReportCategories,
  categoryToLabel,
  certificationIssueReportSubcategories,
  subcategoryToLabel,
  subcategoryToCode,
} from 'pix-certif/models/certification-issue-report';
import { RadioButtonCategoryWithSubcategoryWithDescriptionAndQuestionNumber } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';

module('Integration | Component | in-challenge-certification-issue-report-fields', function(hooks) {
  setupRenderingTest(hooks);
  const CHAR_COUNT_SELECTOR = '.candidate-information-change-certification-issue-report-fields-details__char-count';

  test('it should call toggle function on click radio button', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryWithDescriptionAndQuestionNumber({ name: 'IN_CHALLENGE', isChecked: false });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('inChallengeCategory', inChallengeCategory);

    // when
    await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(`[aria-label="Sélectionner la catégorie '${categoryToLabel[certificationIssueReportCategories.IN_CHALLENGE]}'"]`);

    // then
    assert.ok(toggleOnCategory.calledOnceWith(inChallengeCategory));
  });

  test('it should show dropdown menu with code & subcategories when category is checked', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryWithDescriptionAndQuestionNumber({ name: 'IN_CHALLENGE', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('inChallengeCategory', inChallengeCategory);

    // when
    await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click('[aria-label="Sélectionner la sous-catégorie"]');

    // then
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]} ${subcategoryToLabel[certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]}`);
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.LINK_NOT_WORKING]} ${subcategoryToLabel[certificationIssueReportSubcategories.LINK_NOT_WORKING]}`);
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.EMBED_NOT_WORKING]} ${subcategoryToLabel[certificationIssueReportSubcategories.EMBED_NOT_WORKING]}`);
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]}`);
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]} ${subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]}`);
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.WEBSITE_BLOCKED]} ${subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_BLOCKED]}`);
    assert.contains(`${subcategoryToCode[certificationIssueReportSubcategories.OTHER]} ${subcategoryToLabel[certificationIssueReportSubcategories.OTHER]}`);
  });

  test('it should show a textarea with characters length when selecting subcategory OTHER', async function(assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryWithDescriptionAndQuestionNumber({ name: 'IN_CHALLENGE', isChecked: true });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('inChallengeCategory', inChallengeCategory);

    // when
    await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click('[aria-label="Sélectionner la sous-catégorie"]');
    await fillIn('[aria-label="Sélectionner la sous-catégorie"]', certificationIssueReportSubcategories.OTHER);
    await fillIn('textarea', 'Coucou');

    // then
    assert.dom(CHAR_COUNT_SELECTOR).hasText('6 / 500');
  });
});
