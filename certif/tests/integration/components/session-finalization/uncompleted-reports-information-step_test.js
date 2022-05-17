import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { render, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import sinon from 'sinon';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';

module('Integration | Component | SessionFinalization::UncompletedReportsInformationStep', function (hooks) {
  setupRenderingTest(hooks);
  let reportA;
  let reportB;
  let store;
  let certificationIssueReportA;

  hooks.beforeEach(function () {
    class FeatureTogglesStub extends Service {
      featureToggles = {};
    }
    this.owner.register('service:feature-toggles', FeatureTogglesStub);
  });

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');

    certificationIssueReportA = run(() =>
      store.createRecord('certification-issue-report', {
        description: 'Coucou',
        category: certificationIssueReportCategories.OTHER,
      })
    );

    reportA = run(() =>
      store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: A([certificationIssueReportA]),
        hasSeenEndTestScreen: null,
      })
    );

    reportB = run(() =>
      store.createRecord('certification-report', {
        certificationCourseId: 3,
        firstName: 'Bob',
        lastName: 'Bober',
        hasSeenEndTestScreen: true,
      })
    );

    this.set('certificationReports', [reportA, reportB]);
    this.set('issueReportDescriptionMaxLength', 500);
  });

  test('it shows "1 signalement" if there is exactly one certification issue report', async function (assert) {
    // given
    const certificationIssueReport = run(() =>
      store.createRecord('certification-issue-report', {
        description: 'Coucou',
        category: certificationIssueReportCategories.OTHER,
      })
    );
    const certificationReport = run(() =>
      store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: [certificationIssueReport],
        hasSeenEndTestScreen: null,
      })
    );

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    // then
    assert
      .dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`)
      .hasText('1 signalement');
  });

  test('it shows "X signalements" (plural) if there is more than one certification issue reports', async function (assert) {
    // given
    const certificationIssueReport1 = run(() =>
      store.createRecord('certification-issue-report', {
        description: 'Coucou',
        category: certificationIssueReportCategories.OTHER,
      })
    );
    const certificationIssueReport2 = run(() =>
      store.createRecord('certification-issue-report', {
        description: 'Les zouzous',
        category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
      })
    );
    const certificationReport = run(() =>
      store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: [certificationIssueReport1, certificationIssueReport2],
        hasSeenEndTestScreen: null,
      })
    );
    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    // then
    assert
      .dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`)
      .hasText('2 signalements');
  });

  test('it calls certificationReport.abort on select update', async function (assert) {
    // given
    const certificationReport = run(() =>
      store.createRecord('certification-report', {
        id: 1234,
        isCompleted: false,
        abort: sinon.stub(),
      })
    );

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    const select = await find(`#finalization-report-abort-reason__select${certificationReport.id}`);
    await fillIn(select, 'technical');

    // then
    sinon.assert.called(abortStub);
    assert.true(true);
  });

  test('it should open add modal when Add button is clicked', async function (assert) {
    // given
    const certificationIssueReport = run(() =>
      store.createRecord('certification-issue-report', {
        description: 'Coucou',
        category: certificationIssueReportCategories.OTHER,
      })
    );
    const certificationReport = run(() =>
      store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: [certificationIssueReport],
        hasSeenEndTestScreen: null,
      })
    );

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);
    await clickByLabel('Ajouter / modifier');

    // then
    assert.contains('Mes signalements (1)');
  });

  test('it should open the issue modal', async function (assert) {
    // given
    const certificationReport = run(() =>
      store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        certificationIssueReports: [],
        hasSeenEndTestScreen: null,
      })
    );

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    await render(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    await clickByLabel('Ajouter ?');

    // then
    assert.contains('Retard, absence ou départ');
  });

  test('it has an accessible label', async function (assert) {
    // given
    this.certificationReports = [
      run(() =>
        store.createRecord('certification-report', {
          certificationCourseId: 1234,
          certificationIssueReports: [],
          hasSeenEndTestScreen: null,
        })
      ),
    ];
    this.abort = sinon.stub();

    // when
    const screen = await renderScreen(hbs`
      <SessionFinalization::UncompletedReportsInformationStep
        @certificationReports={{this.certificationReports}}
        @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
        @onChangeAbortReason={{this.abort}}
      />
    `);

    // then
    assert.dom(screen.getByRole('table', { name: "Ces candidats n'ont pas fini leur test de certification" })).exists();
  });
});
