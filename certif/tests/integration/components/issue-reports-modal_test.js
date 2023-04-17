import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import {
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  categoryToLabel,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | issue-reports-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it show candidate information in title', async function (assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });
    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('reportToEdit', report);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);
    this.set('onClickIssueReport', onClickIssueReportStub);

    // when
    const { getByRole } = await render(hbs`
      <IssueReportModal::IssueReportsModal
        @showModal={{true}}
        @report={{this.reportToEdit}}
        @closeModal={{this.closeIssueReportsModal}}
        @onClickIssueReport={{this.onClickIssueReport}}
      />
    `);

    // then
    assert.dom(getByRole('heading', { name: 'Signalement du candidat : Lisa Monpud' })).exists();
  });

  test('it should close modal onclick "Ajouter un signalement"', async function (assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });
    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('report', report);
    this.set('onClickIssueReport', onClickIssueReportStub);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);

    // when
    const { getByRole } = await render(hbs`
      <IssueReportModal::IssueReportsModal
        @showModal={{true}}
        @report={{this.report}}
        @closeModal={{this.closeIssueReportsModal}}
        @onClickIssueReport={{this.onClickIssueReport}}
      />
    `);
    await click(getByRole('button', { name: 'Ajouter un signalement' }));

    // then
    assert.ok(onClickIssueReportStub.calledOnceWith(report));
  });

  test('it should show Mes signalements (2)', async function (assert) {
    // given
    const issue1 = EmberObject.create({
      category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES],
    });

    const issue2 = EmberObject.create({
      category: certificationIssueReportCategories.SIGNATURE_ISSUE,
      categoryLabel: categoryToLabel[certificationIssueReportCategories.SIGNATURE_ISSUE],
    });

    const report = EmberObject.create({
      certificationCourseId: 1,
      certificationIssueReports: [issue1, issue2],
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });
    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('report', report);
    this.set('onClickIssueReport', onClickIssueReportStub);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);

    // when
    await render(hbs`
      <IssueReportModal::IssueReportsModal
        @showModal={{true}}
        @report={{this.report}}
        @closeModal={{this.closeIssueReportsModal}}
        @onClickIssueReport={{this.onClickIssueReport}}
      />
    `);

    // then
    assert.contains('Mes signalements (2)');
  });

  test('it should list existing issue reports with subcategory', async function (assert) {
    // given
    const issue1 = EmberObject.create({
      category: certificationIssueReportCategories.SIGNATURE_ISSUE,
      categoryLabel: categoryToLabel[certificationIssueReportCategories.SIGNATURE_ISSUE],
    });

    const issue2 = EmberObject.create({
      category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES],
      subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      subcategoryLabel: subcategoryToLabel[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE],
    });

    const report = EmberObject.create({
      certificationCourseId: 1,
      certificationIssueReports: [issue1, issue2],
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });
    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('report', report);
    this.set('onClickIssueReport', onClickIssueReportStub);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);

    // when
    await render(hbs`
      <IssueReportModal::IssueReportsModal
        @showModal={{true}}
        @report={{this.report}}
        @closeModal={{this.closeIssueReportsModal}}
        @onClickIssueReport={{this.onClickIssueReport}}
      />
    `);

    // then
    assert.contains(this.intl.t(categoryToLabel[certificationIssueReportCategories.SIGNATURE_ISSUE]));
    assert.contains(this.intl.t(categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]));
    assert.contains(this.intl.t(subcategoryToLabel[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]));
    assert.dom('li').exists({ count: 2 });
  });
});
