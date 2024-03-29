import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

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
          "Ces candidats n'ont pas fini leur test de certification ou le surveillant a mis fin à leur test",
        ),
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
          "Ces candidats n'ont pas fini leur test de certification ou le surveillant a mis fin à leur test",
        ),
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

    await click(screen.getByRole('button', { name: "Sélectionner la raison de l'abandon" }));
    await click(
      await screen.findByRole('option', {
        name: 'Problème technique',
      }),
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
    await click(screen.getByRole('button', { name: 'Ajouter / Supprimer' }));
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
          name: "Ces candidats n'ont pas fini leur test de certification ou le surveillant a mis fin à leur test Liste des candidats qui n’ont pas fini leur test de certification, triée par nom de naissance, avec un lien pour ajouter un ou plusieurs signalements le cas échéant et une liste déroulante permettant de sélectionner la raison de l’abandon.",
        }),
      )
      .exists();
  });

  module('when certification is V3', function () {
    module('when issue report contains IN_CHALLENGE (E1-E12) issues', function () {
      test('it should not display the delete button for these issues', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set('issueReportDescriptionMaxLength', 500);

        const session = store.createRecord('session', {
          version: 3,
        });

        const issue1 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.IN_CHALLENGE,
        });

        const certificationReport = store.createRecord('certification-report', {
          certificationCourseId: 1234,
          firstName: 'Alice',
          lastName: 'Alister',
          certificationIssueReports: [issue1],
          hasSeenEndTestScreen: null,
        });

        const abortStub = sinon.stub();

        this.set('certificationReports', [certificationReport]);
        this.set('abort', abortStub);
        this.set('session', session);

        // when
        const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
          @session={{this.session}}
        />
      `);

        await click(screen.getByRole('button', { name: 'Ajouter / Supprimer' }));
        await screen.findByRole('dialog');

        // then
        assert.dom(screen.queryByRole('button', { name: 'Supprimer le signalement' })).doesNotExist();
      });
    });

    module('when issue report does not contain IN_CHALLENGE (E1-E12) issues', function () {
      test('it should display the delete button for these issues', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set('issueReportDescriptionMaxLength', 500);

        const session = store.createRecord('session', {
          version: 3,
        });

        const issue1 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        });

        const certificationReport = store.createRecord('certification-report', {
          certificationCourseId: 1234,
          firstName: 'Alice',
          lastName: 'Alister',
          certificationIssueReports: [issue1],
          hasSeenEndTestScreen: null,
        });

        const abortStub = sinon.stub();

        this.set('certificationReports', [certificationReport]);
        this.set('abort', abortStub);
        this.set('session', session);

        // when
        const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
          @session={{this.session}}
        />
      `);

        await click(screen.getByRole('button', { name: 'Ajouter / Supprimer' }));
        await screen.findByRole('dialog');

        // then
        assert.dom(screen.queryByRole('button', { name: 'Supprimer le signalement' })).exists();
      });
    });
  });

  module('when certification is V2', function () {
    module('when issue report contains IN_CHALLENGE (E1-E12) issues', function () {
      test('it should display the delete button for these issues', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const session = store.createRecord('session', {
          version: 2,
        });

        const issue1 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.IN_CHALLENGE,
        });

        const issue2 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        });

        const certificationReport = store.createRecord('certification-report', {
          certificationCourseId: 1234,
          firstName: 'Alice',
          lastName: 'Alister',
          certificationIssueReports: [issue1, issue2],
          hasSeenEndTestScreen: null,
        });

        const abortStub = sinon.stub();

        this.set('certificationReports', [certificationReport]);
        this.set('abort', abortStub);
        this.set('session', session);

        // when
        const screen = await renderScreen(hbs`
        <SessionFinalization::UncompletedReportsInformationStep
          @certificationReports={{this.certificationReports}}
          @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
          @onChangeAbortReason = {{this.abort}}
          @session={{this.session}}
        />
      `);

        await click(screen.getByRole('button', { name: 'Ajouter / Supprimer' }));
        await screen.findByRole('dialog');

        // then
        assert.strictEqual(screen.queryAllByRole('button', { name: 'Supprimer le signalement' }).length, 2);
      });
    });
  });
});
