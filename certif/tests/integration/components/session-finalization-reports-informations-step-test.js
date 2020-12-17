import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';

module('Integration | Component | session-finalization-reports-informations-step', function(hooks) {
  setupRenderingTest(hooks);
  let reportA;
  let reportB;
  let store;
  let certificationIssueReportA;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');

    certificationIssueReportA = run(() => store.createRecord('certification-issue-report', {
      description: 'Coucou',
      category: certificationIssueReportCategories.OTHER,
    }));

    reportA = run(() => store.createRecord('certification-report', {
      certificationCourseId: 1234,
      firstName: 'Alice',
      lastName: 'Alister',
      certificationIssueReports: A([certificationIssueReportA]),
      hasSeenEndTestScreen: null,
    }));

    reportB = run(() => store.createRecord('certification-report', {
      certificationCourseId: 3,
      firstName: 'Bob',
      lastName: 'Bober',
      hasSeenEndTestScreen: true,
    }));
    this.set('certificationReports', [reportA, reportB]);
    this.set('updateCertificationIssueReport', sinon.stub().returns('new comment'));
    this.set('issueReportDescriptionMaxLength', 500);
    this.set('toggleCertificationReportHasSeenEndTestScreen', sinon.stub().returns());
    this.set('toggleAllCertificationReportsHasSeenEndTestScreen', sinon.stub().returns());
  });

  module('when feature categorizationOfReports is off', function() {

    test('it renders', async function(assert) {
      // given
      this.set('isReportsCategorizationFeatureToggleEnabled', false);

      // when
      await render(hbs`
        <SessionFinalizationReportsInformationsStep
          @certificationReports={{this.certificationReports}}
          @updateCertificationIssueReport={{this.updateCertificationIssueReport}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @toggleCertificationReportHasSeenEndTestScreen={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @toggleAllCertificationReportsHasSeenEndTestScreen={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
        />
      `);

      // then
      assert.dom(`[data-test-id="finalization-report-last-name_${reportA.certificationCourseId}"]`).hasText(reportA.lastName);
      assert.dom(`[data-test-id="finalization-report-first-name_${reportA.certificationCourseId}"]`).hasText(reportA.firstName);
      assert.dom(`[data-test-id="finalization-report-certification-number_${reportA.certificationCourseId}"]`).hasText(reportA.certificationCourseId.toString());
      assert.dom(`[data-test-id="finalization-report-last-name_${reportB.certificationCourseId}"]`).hasText(reportB.lastName);
      assert.dom(`[data-test-id="finalization-report-first-name_${reportB.certificationCourseId}"]`).hasText(reportB.firstName);
      assert.dom(`[data-test-id="finalization-report-certification-number_${reportB.certificationCourseId}"]`).hasText(reportB.certificationCourseId.toString());
    });
  });

  module('when feature categorizationOfReports is on', function() {

    test('it shows "1 signalement" if there is exactly one certification issue report', async function(assert) {
      // given
      const certificationIssueReport = run(() => store.createRecord('certification-issue-report', {
        description: 'Coucou',
        category: certificationIssueReportCategories.OTHER,
      }));
      const certificationReport = run(() => store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: [certificationIssueReport],
        hasSeenEndTestScreen: null,
      }));
      this.set('certificationReports', [certificationReport]);
      this.set('isReportsCategorizationFeatureToggleEnabled', true);

      // when
      await render(hbs`
        <SessionFinalizationReportsInformationsStep
          @certificationReports={{this.certificationReports}}
          @updateCertificationIssueReport={{this.updateCertificationIssueReport}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @toggleCertificationReportHasSeenEndTestScreen={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @toggleAllCertificationReportsHasSeenEndTestScreen={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
          @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
        />
      `);

      // then
      assert.dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`).hasText('1 signalement');
    });

    test('it shows "X signalements" (plural) if there is more than one certification issue reports', async function(assert) {
      // given
      const certificationIssueReport1 = run(() => store.createRecord('certification-issue-report', {
        description: 'Coucou',
        category: certificationIssueReportCategories.OTHER,
      }));
      const certificationIssueReport2 = run(() => store.createRecord('certification-issue-report', {
        description: 'Les zouzous',
        category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
      }));
      const certificationReport = run(() => store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: [certificationIssueReport1, certificationIssueReport2],
        hasSeenEndTestScreen: null,
      }));
      this.set('certificationReports', [certificationReport]);
      this.set('isReportsCategorizationFeatureToggleEnabled', true);

      // when
      await render(hbs`
        <SessionFinalizationReportsInformationsStep
          @certificationReports={{this.certificationReports}}
          @updateCertificationIssueReport={{this.updateCertificationIssueReport}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @toggleCertificationReportHasSeenEndTestScreen={{this.toggleCertificationReportHasSeenEndTestScreen}}
          @toggleAllCertificationReportsHasSeenEndTestScreen={{this.toggleAllCertificationReportsHasSeenEndTestScreen}}
          @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
        />
      `);

      // then
      assert.dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`).hasText('2 signalements');
    });
  });
});
