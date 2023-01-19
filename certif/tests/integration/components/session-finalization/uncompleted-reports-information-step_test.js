import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | SessionFinalization::UncompletedReportsInformationStep', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it shows "1 signalement" if there is exactly one certification issue report', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('issueReportDescriptionMaxLength', 500);
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

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    // then
    assert
      .dom(
        screen.getByText(
          "Ces candidats n'ont pas fini leur test de certification ou le surveillant a mis fin à leur test"
        )
      )
      .exists();
    assert.dom(screen.getByText('1 signalement')).exists();
  });

  test('it shows "X signalements" (plural) if there is more than one certification issue reports', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('issueReportDescriptionMaxLength', 500);
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
    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    // then
    assert
      .dom(
        screen.getByText(
          "Ces candidats n'ont pas fini leur test de certification ou le surveillant a mis fin à leur test"
        )
      )
      .exists();
    assert.dom(screen.getByText('2 signalements')).exists();
  });

  test('it calls certificationReport.abort on select update', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('issueReportDescriptionMaxLength', 500);
    const certificationReport = store.createRecord('certification-report', {
      id: 1234,
      isCompleted: false,
      abort: sinon.stub(),
    });

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    await click(screen.getByRole('button', { name: '-- Choisissez --' }));
    await click(
      await screen.findByRole('option', {
        name: 'Problème technique',
      })
    );

    // then
    sinon.assert.called(abortStub);
    assert.true(true);
  });

  test('it should open add modal when Add button is clicked', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('issueReportDescriptionMaxLength', 500);
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

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);
    await click(screen.getByRole('button', { name: 'Ajouter / supprimer' }));
    await screen.findByRole('dialog');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mes signalements (1)' })).exists();
  });

  test('it should open the issue modal', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('issueReportDescriptionMaxLength', 500);
    const certificationReport = store.createRecord('certification-report', {
      certificationCourseId: 1234,
      firstName: 'Alice',
      lastName: 'Alister',
      certificationIssueReports: [],
      hasSeenEndTestScreen: null,
    });

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
        />
      `);

    await click(screen.getByRole('button', { name: 'Ajouter' }));
    await screen.findByRole('dialog');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Signalement du candidat : Alice Alister' })).exists();
    assert.dom(screen.getByText('Modification infos candidat')).exists();
  });

  test('it has an accessible label and caption', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('issueReportDescriptionMaxLength', 500);
    this.certificationReports = [
      store.createRecord('certification-report', {
        certificationCourseId: 1234,
        certificationIssueReports: [],
        hasSeenEndTestScreen: null,
      }),
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
    assert
      .dom(
        screen.getByRole('table', {
          name: `Ces candidats n'ont pas fini leur test de certification ou le surveillant a mis fin à leur test ${this.intl.t(
            'pages.sessions.finalize.unfinished-test-list-description'
          )}`,
        })
      )
      .exists();
  });
});
