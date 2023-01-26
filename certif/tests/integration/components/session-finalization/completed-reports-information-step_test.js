import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | SessionFinalization::CompletedReportsInformationStep', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');

    this.set('issueReportDescriptionMaxLength', 500);
    this.set('toggleCertificationReportHasSeenEndTestScreen', sinon.stub().returns());
    this.set('toggleAllCertificationReportsHasSeenEndTestScreen', sinon.stub().returns());
  });

  test('it shows "1 signalement" if there is exactly one certification issue report', async function (assert) {
    // given
    const certificationIssueReport = store.createRecord('certification-issue-report', {
      description: 'Coucou',
      category: certificationIssueReportCategories.FRAUD,
    });
    const certificationReport = store.createRecord('certification-report', {
      certificationCourseId: 1234,
      firstName: 'Alice',
      lastName: 'Alister',
      certificationIssueReports: [certificationIssueReport],
      hasSeenEndTestScreen: null,
    });
    this.set('certificationReports', [certificationReport]);

    // when
    await render(hbs`
        <SessionFinalization::CompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onHasSeenEndTestScreenCheckboxClicked={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @onAllHasSeenEndTestScreenCheckboxesClicked={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
        />
      `);

    // then
    assert
      .dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`)
      .hasText('1 signalement');
  });

  test('it shows "X signalements" (plural) if there is more than one certification issue reports', async function (assert) {
    // given
    const certificationIssueReport1 = store.createRecord('certification-issue-report', {
      description: 'Coucou',
      category: certificationIssueReportCategories.FRAUD,
    });
    const certificationIssueReport2 = store.createRecord('certification-issue-report', {
      description: 'Les zouzous',
      category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
    });
    const certificationReport = store.createRecord('certification-report', {
      certificationCourseId: 1234,
      firstName: 'Alice',
      lastName: 'Alister',
      certificationIssueReports: [certificationIssueReport1, certificationIssueReport2],
      hasSeenEndTestScreen: null,
    });
    this.set('certificationReports', [certificationReport]);

    // when
    await render(hbs`
        <SessionFinalization::CompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onHasSeenEndTestScreenCheckboxClicked={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @onAllHasSeenEndTestScreenCheckboxesClicked={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
        />
      `);

    // then
    assert
      .dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`)
      .hasText('2 signalements');
  });

  test('it shows "Certification(s) terminée(s)" if there is at least one uncomplete certification report', async function (assert) {
    // given
    const certificationReport1 = store.createRecord('certification-report', { isCompleted: false });
    const certificationReport2 = store.createRecord('certification-report', { isCompleted: true });
    const session = store.createRecord('session', {
      certificationReports: [certificationReport1, certificationReport2],
    });
    this.set('certificationReports', [certificationReport1, certificationReport2]);
    this.set('session', session);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::CompletedReportsInformationStep
          @session={{this.session}}
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onHasSeenEndTestScreenCheckboxClicked={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @onAllHasSeenEndTestScreenCheckboxesClicked={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
        />
      `);

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: `Certification(s) terminée(s) ${this.intl.t('pages.sessions.finalize.finished-test-list-description')}`,
        })
      )
      .exists();
  });

  test('it does not show "Certification(s) terminée(s)" if there is no uncomplete certification report', async function (assert) {
    // given
    const certificationReport1 = store.createRecord('certification-report', { isCompleted: true });
    const certificationReport2 = store.createRecord('certification-report', { isCompleted: true });
    const session = store.createRecord('session', {
      certificationReports: [certificationReport1, certificationReport2],
    });
    this.set('certificationReports', [certificationReport1, certificationReport2]);
    this.set('session', session);

    // when
    await render(hbs`
        <SessionFinalization::CompletedReportsInformationStep
          @session={{this.session}}
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onHasSeenEndTestScreenCheckboxClicked={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @onAllHasSeenEndTestScreenCheckboxesClicked={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
        />
      `);

    // then
    assert.dom('.session-finalization-reports-information-step__title-completed').doesNotExist();
  });

  module('when the end test screen removal feature was disabled during the certification', function () {
    test('it shows the "Écran de fin de test vu" column', async function (assert) {
      // given
      this.certificationReports = [
        store.createRecord('certification-report', {
          hasSeenEndTestScreen: null,
          certificationCourseId: 1,
        }),
      ];
      this.issueReportDescriptionMaxLength = 500;
      this.toggleCertificationReportHasSeenEndTestScreen = sinon.stub().returns();
      this.toggleAllCertificationReportsHasSeenEndTestScreen = sinon.stub().returns();
      this.shouldDisplayHasSeenEndTestScreenCheckbox = true;

      // when
      await render(hbs`
        <SessionFinalization::CompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onHasSeenEndTestScreenCheckboxClicked={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @onAllHasSeenEndTestScreenCheckboxesClicked={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
          @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
        />
      `);

      // then
      assert.dom('[data-test-id="finalization-report-all-candidates-have-seen-end-test-screen"]').exists();
      assert.dom('[data-test-id="finalization-report-has-seen-end-test-screen_1"]').exists();
    });
  });

  module('when the end test screen removal feature was enabled during the certification', function () {
    test('it hides the "Écran de fin de test vu" column', async function (assert) {
      // given
      this.certificationReports = [
        store.createRecord('certification-report', {
          hasSeenEndTestScreen: null,
          certificationCourseId: 1,
        }),
      ];
      this.issueReportDescriptionMaxLength = 500;
      this.shouldDisplayHasSeenEndTestScreenCheckbox = false;

      // when
      await render(hbs`
        <SessionFinalization::CompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
        />
      `);

      // then
      assert.dom('[data-test-id="finalization-report-all-candidates-have-seen-end-test-screen"]').doesNotExist();
      assert.dom('[data-test-id="finalization-report-has-seen-end-test-screen_1"]').doesNotExist();
    });
  });
});
