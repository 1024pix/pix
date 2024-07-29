import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  categoryToLabel,
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | issue-report-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it show candidate information in title', async function (assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });
    this.set('report', report);
    this.set('closeModal', sinon.stub());
    this.set('onClickIssueReport', sinon.stub());
    this.set('onClickDeleteIssueReport', sinon.stub());

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @closeModal={{this.closeModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
  @onClickDeleteIssueReport={{this.onClickDeleteIssueReport}}
  @report={{this.report}}
/>`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Signalement du candidat : Lisa Monpud', level: 1 })).exists();
  });

  test('it shows the number of issue reports', async function (assert) {
    // given
    const issue1 = EmberObject.create({
      description: 'issue1',
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES],
    });

    const issue2 = EmberObject.create({
      description: 'issue2',
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES],
    });

    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
      certificationIssueReports: [issue1, issue2],
    });
    this.set('report', report);
    this.set('closeModal', sinon.stub());
    this.set('onClickIssueReport', sinon.stub());
    this.set('onClickDeleteIssueReport', sinon.stub());

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @closeModal={{this.closeModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
  @onClickDeleteIssueReport={{this.onClickDeleteIssueReport}}
  @report={{this.report}}
/>`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mes signalements (2)', level: 2 })).exists();
  });

  test('it shows a list of issue reports', async function (assert) {
    // given
    const issue1 = EmberObject.create({
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES],
      subcategoryLabel: subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_BLOCKED],
    });

    const issue2 = EmberObject.create({
      categoryLabel: categoryToLabel[certificationIssueReportCategories.FRAUD],
      subcategoryLabel: subcategoryToLabel[certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING],
    });

    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
      certificationIssueReports: [issue1, issue2],
    });
    this.set('report', report);
    this.set('closeModal', sinon.stub());
    this.set('onClickIssueReport', sinon.stub());
    this.set('onClickDeleteIssueReport', sinon.stub());

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @closeModal={{this.closeModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
  @onClickDeleteIssueReport={{this.onClickDeleteIssueReport}}
  @report={{this.report}}
/>`);

    // then
    assert
      .dom(
        screen.getByText(
          this.intl.t(categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]),
        ),
      )
      .exists();
    assert
      .dom(screen.getByText(this.intl.t(subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_BLOCKED])))
      .exists();
    assert.dom(screen.getByText(this.intl.t(categoryToLabel[certificationIssueReportCategories.FRAUD]))).exists();
    assert
      .dom(
        screen.getByText(this.intl.t(subcategoryToLabel[certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING])),
      )
      .exists();
  });

  test('it calls a function linked to the close button', async function (assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });

    const closeModal = sinon.stub();

    this.set('report', report);
    this.set('closeModal', closeModal);
    this.set('onClickIssueReport', sinon.stub());
    this.set('onClickDeleteIssueReport', sinon.stub());

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @closeModal={{this.closeModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
  @onClickDeleteIssueReport={{this.onClickDeleteIssueReport}}
  @report={{this.report}}
/>`);

    await click(screen.getByRole('button', { name: 'Fermer' }));

    // then
    sinon.assert.calledOnce(closeModal);
    assert.ok(true);
  });

  test('it calls a function linked to the add button', async function (assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });

    const onClickIssueReport = sinon.stub();

    this.set('report', report);
    this.set('closeModal', sinon.stub());
    this.set('onClickIssueReport', onClickIssueReport);
    this.set('onClickDeleteIssueReport', sinon.stub());

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @closeModal={{this.closeModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
  @onClickDeleteIssueReport={{this.onClickDeleteIssueReport}}
  @report={{this.report}}
/>`);

    await click(screen.getByRole('button', { name: 'Ajouter un signalement' }));

    // then
    sinon.assert.calledOnce(onClickIssueReport);
    assert.ok(true);
  });

  test('it calls a function linked to the delete button', async function (assert) {
    // given
    const issue = EmberObject.create({
      categoryLabel: categoryToLabel[certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES],
      subcategoryLabel: subcategoryToLabel[certificationIssueReportSubcategories.WEBSITE_BLOCKED],
    });

    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
      certificationIssueReports: [issue],
    });

    const onClickDeleteIssueReport = sinon.stub();

    this.set('report', report);
    this.set('closeModal', sinon.stub());
    this.set('onClickIssueReport', sinon.stub());
    this.set('onClickDeleteIssueReport', onClickDeleteIssueReport);

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @closeModal={{this.closeModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
  @onClickDeleteIssueReport={{this.onClickDeleteIssueReport}}
  @report={{this.report}}
/>`);

    await click(screen.getByRole('button', { name: 'Supprimer le signalement' }));

    // then
    sinon.assert.calledOnce(onClickDeleteIssueReport);
    assert.ok(true);
  });
});
