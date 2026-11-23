import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { RadioButtonCategoryWithSubcategoryAndQuestionNumber } from 'pix-certif/components/issue-report-modal/add-issue-report-modal';
import {
  categoryToLabel,
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import { t } from 'pix-certif/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

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
    await render(hbs`<IssueReportModal::InChallengeCertificationIssueReportFields
  @inChallengeCategory={{this.inChallengeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
/>`);

    await click(
      `[aria-label="${t(
        'pages.session-finalization.add-issue-modal.actions.select-category-label',
      )} '${t(categoryToLabel[certificationIssueReportCategories.IN_CHALLENGE])}'"]`,
    );

    // then
    assert.ok(toggleOnCategory.calledOnceWith(inChallengeCategory));
  });

  test(`it should display all subcategories when the category is checked`, async function (assert) {
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
    const screen = await render(hbs`<IssueReportModal::InChallengeCertificationIssueReportFields
  @inChallengeCategory={{this.inChallengeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
/>`);

    await click(screen.getByLabelText(t('pages.session-finalization.add-issue-modal.actions.select-subcategory')));

    await screen.findByRole('listbox');

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
      const [subcategoryCode, subcategoryLabel] = subcategory.split(' ');
      assert.dom(screen.getByRole('option', { name: `${subcategoryCode} ${t(subcategoryLabel)}` })).exists();
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
    const screen = await render(hbs`<IssueReportModal::InChallengeCertificationIssueReportFields
  @inChallengeCategory={{this.inChallengeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
/>`);

    //
    assert.dom(screen.getByText(`E1-E12`)).exists();
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
    const screen = await render(hbs`<IssueReportModal::InChallengeCertificationIssueReportFields
  @inChallengeCategory={{this.inChallengeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
/>`);
    await click(screen.getByLabelText(t('pages.session-finalization.add-issue-modal.actions.select-subcategory')));
    await click(
      await screen.findByRole('option', {
        name: `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${t(
          subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING],
        )}`,
      }),
    );

    // then
    const subcategorySelect = screen.getByRole('button', {
      name: t('pages.session-finalization.add-issue-modal.actions.select-subcategory'),
    });
    assert
      .dom(subcategorySelect)
      .includesText(
        `${subcategoryToCode[certificationIssueReportSubcategories.FILE_NOT_OPENING]} ${t(
          subcategoryToLabel[certificationIssueReportSubcategories.FILE_NOT_OPENING],
        )}`,
      );
  });
});
