import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import {
  certificationIssueReportCategories,
  categoryToLabel,
  certificationIssueReportSubcategories,
  subcategoryToLabel,
  subcategoryToCode,
} from 'pix-certif/models/certification-issue-report';
import { RadioButtonCategoryWithSubcategoryAndQuestionNumber } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';

module('Integration | Component | in-challenge-certification-issue-report-fields', function (hooks) {
  setupRenderingTest(hooks);

  const featureToggles = {
    isCertificationFreeFieldsDeletionEnabled: true,
  };

  hooks.beforeEach(function () {
    class FeatureTogglesStub extends Service {
      featureToggles = featureToggles;
    }
    this.owner.register('service:feature-toggles', FeatureTogglesStub);
  });

  hooks.afterEach(function () {
    featureToggles.isCertificationFreeFieldsDeletionEnabled = true;
  });

  test('it should call toggle function on click radio button', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      isChecked: false,
    });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('inChallengeCategory', inChallengeCategory);

    // when
    await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(
      `[aria-label="Sélectionner la catégorie '${categoryToLabel[certificationIssueReportCategories.IN_CHALLENGE]}'"]`
    );

    // then
    assert.ok(toggleOnCategory.calledOnceWith(inChallengeCategory));
  });

  test('it should show dropdown menu with code & subcategories when category is checked and FT is enabled', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      isChecked: true,
    });
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
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.EMBED_NOT_WORKING]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.EMBED_NOT_WORKING]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.WEBSITE_BLOCKED]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_BLOCKED]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]
      }`
    );
    assert.contains(
      `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${
        subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]
      }`
    );
  });

  test('subcategory FILE_NOT_OPENING with FT disabled', async function (assert) {
    // given
    featureToggles.isCertificationFreeFieldsDeletionEnabled = false;
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      isChecked: true,
    });
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

    //
    assert.contains(
      `${
        subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]
      } Le fichier à télécharger ne s'ouvre pas`
    );
  });
});
