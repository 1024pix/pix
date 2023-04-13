import { module, test } from 'qunit';
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
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | in-challenge-certification-issue-report-fields', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should call toggle function on click radio button', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const intl = this.owner.lookup('service:intl');
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      isChecked: false,
      intl,
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
      `[aria-label="${this.intl.t(
        'pages.session-finalization.add-issue-modal.actions.select-category-label'
      )} '${this.intl.t(categoryToLabel[certificationIssueReportCategories.IN_CHALLENGE])}'"]`
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
      const [subcategoryCode, subcategoryLabel] = subcategory.split(' ');
      const intl = this.owner.lookup('service:intl');
      const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
        name: 'IN_CHALLENGE',
        isChecked: true,
        intl,
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

      await click(
        screen.getByLabelText(this.intl.t('pages.session-finalization.add-issue-modal.actions.select-subcategory'))
      );

      await click(
        await screen.findByRole('option', {
          name: `${subcategoryCode} ${this.intl.t(subcategoryLabel)}`,
        })
      );

      // then
      assert
        .dom(
          screen.getByRole('option', {
            selected: true,
            name: `${subcategoryCode} ${this.intl.t(subcategoryLabel)}`,
          })
        )
        .exists();
    });
  });

  test('category', async function (assert) {
    // given
    const toggleOnCategory = () => {};
    const intl = this.owner.lookup('service:intl');
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      intl,
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
    const intl = this.owner.lookup('service:intl');
    const inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
      name: 'IN_CHALLENGE',
      isChecked: true,
      intl,
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
    await click(
      screen.getByLabelText(this.intl.t('pages.session-finalization.add-issue-modal.actions.select-subcategory'))
    );
    await click(
      await screen.findByRole('option', {
        name: `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${this.intl.t(
          subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]
        )}`,
      })
    );

    // then
    assert
      .dom(
        screen.getByRole('option', {
          name: `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${this.intl.t(
            subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING]
          )}`,
        })
      )
      .exists();
  });
});
