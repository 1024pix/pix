import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
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
    });

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
/>`);

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
    });
    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
/>`);

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
      id: '1234',
      isCompleted: false,
      abort: sinon.stub(),
    });

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @onChangeAbortReason={{this.abort}}
/>`);

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
    });

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
/>`);
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
    });

    const abortStub = sinon.stub();

    this.set('certificationReports', [certificationReport]);
    this.set('abort', abortStub);

    // when
    const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
/>`);

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
      }),
    ];
    this.abort = sinon.stub();

    // when
    const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
/>`);

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: t('pages.session-finalization.reporting.uncompleted-reports-information.extra-information'),
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

        const session = store.createRecord('session-management', {
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
        });

        const abortStub = sinon.stub();

        this.set('certificationReports', [certificationReport]);
        this.set('abort', abortStub);
        this.set('session', session);

        // when
        const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
  @session={{this.session}}
/>`);

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

        const session = store.createRecord('session-management', {
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
        });

        const abortStub = sinon.stub();

        this.set('certificationReports', [certificationReport]);
        this.set('abort', abortStub);
        this.set('session', session);

        // when
        const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
  @session={{this.session}}
/>`);

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
        const session = store.createRecord('session-management', {
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
        });

        const abortStub = sinon.stub();

        this.set('certificationReports', [certificationReport]);
        this.set('abort', abortStub);
        this.set('session', session);

        // when
        const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
  @onChangeAbortReason={{this.abort}}
  @session={{this.session}}
/>`);

        await click(screen.getByRole('button', { name: 'Ajouter / Supprimer' }));
        await screen.findByRole('dialog');

        // then
        assert.strictEqual(screen.queryAllByRole('button', { name: 'Supprimer le signalement' }).length, 2);
      });
    });
  });

  module('when abort reason is already set', function () {
    test('the select is disabled and the tooltip is visible', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReport = store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        abortReason: 'technical',
        certificationIssueReports: [],
      });

      this.set('certificationReports', [certificationReport]);
      this.set('abort', sinon.stub());

      // when
      const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @onChangeAbortReason={{this.abort}}
/>`);

      // then
      assert.dom(screen.getByRole('combobox', { name: "Sélectionner la raison de l'abandon" })).isDisabled();
      assert
        .dom(
          screen.getByText(
            t(
              'pages.session-finalization.reporting.uncompleted-reports-information.table.tooltip.technical-problem-auto-detected',
            ),
          ),
        )
        .exists();
    });
  });

  module('when abort reason is not set', function () {
    test('the select is enabled', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationReport = store.createRecord('certification-report', {
        certificationCourseId: 1234,
        firstName: 'Alice',
        lastName: 'Alister',
        abortReason: null,
        certificationIssueReports: [],
      });

      this.set('certificationReports', [certificationReport]);
      this.set('abort', sinon.stub());

      // when
      const screen = await renderScreen(hbs`<SessionFinalization::UncompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @onChangeAbortReason={{this.abort}}
/>`);

      // then
      assert.dom(screen.getByRole('combobox', { name: "Sélectionner la raison de l'abandon" })).isNotDisabled();
    });
  });
});
