import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { render, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import sinon from 'sinon';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';

module('Integration | Component | SessionFinalization::UnUncompletedReportsInformationStep', function(hooks) {
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
    this.set('issueReportDescriptionMaxLength', 500);
  });

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

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
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

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
        />
      `);

    // then
    assert.dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`).hasText('2 signalements');
  });

  test('it calls onChangeCancelReason on select update', async function(assert) {
    // given
    const certificationReport = run(() => store.createRecord('certification-report', {
      isCompleted: false,
    }));
    this.set('certificationReports', [certificationReport]);
    const onChangeCancelReason = sinon.stub().returns();
    this.set('onChangeCancelReason', onChangeCancelReason);

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @onChangeCancelReason={{this.onChangeCancelReason}}
        />
      `);

    const select = await find('#finalization-report-cancel-reason__select');
    await fillIn(select, 'technical');

    // then
    sinon.assert.calledWith(onChangeCancelReason, 'technical');
    assert.true(true);
  });
});
