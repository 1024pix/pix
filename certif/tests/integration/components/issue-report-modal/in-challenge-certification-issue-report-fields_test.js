import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import {
  categoryToLabel,
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import { RadioButtonCategoryWithSubcategoryAndQuestionNumber } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';

module('Integration | Component | in-challenge-certification-issue-report-fields', function (hooks) {
  setupRenderingTest(hooks);

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

  [
    `${subcategoryToCode[certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.EMBED_NOT_WORKING]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.EMBED_NOT_WORKING]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.WEBSITE_BLOCKED]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_BLOCKED]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.SKIP_ON_OOPS]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.SKIP_ON_OOPS]
    }`,
    `${subcategoryToCode[certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE]} ${
      subcategoryToLabel[certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE]
    }`,
  ].forEach(function (subcategory) {
    test(`it should select the subcategory: ${subcategory} when category is checked`, async function (assert) {
      // given
      const toggleOnCategory = sinon.stub();
      const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
        name: 'IN_CHALLENGE',
        isChecked: true,
      });
      this.set('toggleOnCategory', toggleOnCategory);
      this.set('inChallengeCategory', inChallengeCategory);

      // when
      const screen = await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
      await click(screen.getByLabelText('Sélectionnez une sous-catégorie :'));
      await click(
        await screen.findByRole('option', {
          name: subcategory,
        })
      );

      // then
      assert
        .dom(
          screen.getByRole('option', {
            selected: true,
            name: subcategory,
          })
        )
        .exists();
    });
  });

  test('category', async function (assert) {
    // given
    const toggleOnCategory = () => {};
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
    });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('inChallengeCategory', inChallengeCategory);

    // when
    await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
      />`);

    //
    assert.contains(`E1-E12`);
  });

  test('subcategory FILE_NOT_OPENING', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      isChecked: true,
    });
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('inChallengeCategory', inChallengeCategory);

    // when
    const screen = await render(hbs`
      <IssueReportModal::InChallengeCertificationIssueReportFields
        @inChallengeCategory={{this.inChallengeCategory}}
        @toggleOnCategory={{this.toggleOnCategory}}
        @maxlength={{500}}
      />`);
    await click(screen.getByLabelText('Sélectionnez une sous-catégorie :'));
    await click(
      await screen.findByRole('option', {
        name: `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${
          subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]
        }`,
      })
    );

    // then
    assert
      .dom(
        screen.getByRole('option', {
          name: `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${
            subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]
          }`,
        })
      )
      .exists();
  });
});
