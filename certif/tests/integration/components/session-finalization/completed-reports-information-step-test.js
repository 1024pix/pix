import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';
import { t } from 'pix-certif/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | SessionFinalization::CompletedReportsInformationStep', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');

    this.set('issueReportDescriptionMaxLength', 500);
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
    });
    this.set('certificationReports', [certificationReport]);

    // when
    await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
/>`);

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
    });
    this.set('certificationReports', [certificationReport]);

    // when
    await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
/>`);

    // then
    assert
      .dom(`[data-test-id="finalization-report-has-examiner-comment_${certificationReport.certificationCourseId}"]`)
      .hasText('2 signalements');
  });

  test('it shows "Certification(s) terminée(s)" if there is at least one uncomplete certification report', async function (assert) {
    // given
    const certificationReport1 = store.createRecord('certification-report', { isCompleted: false });
    const certificationReport2 = store.createRecord('certification-report', { isCompleted: true });
    const session = store.createRecord('session-management', {
      certificationReports: [certificationReport1, certificationReport2],
    });

    this.set('certificationReports', [certificationReport1, certificationReport2]);
    this.set('session', session);

    // when
    const screen = await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @session={{this.session}}
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
/>`);

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: t('pages.session-finalization.reporting.completed-reports-information.extra-information'),
        }),
      )
      .exists();
  });

  test('it does not show "Certification(s) terminée(s)" if there is no uncomplete certification report', async function (assert) {
    // given
    const certificationReport1 = store.createRecord('certification-report', { isCompleted: true });
    const certificationReport2 = store.createRecord('certification-report', { isCompleted: true });
    const session = store.createRecord('session-management', {
      certificationReports: [certificationReport1, certificationReport2],
    });
    this.set('certificationReports', [certificationReport1, certificationReport2]);
    this.set('session', session);

    // when
    const screen = await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @session={{this.session}}
  @certificationReports={{this.certificationReports}}
  @issueReportDescriptionMaxLength={{this.issueReportDescriptionMaxLength}}
/>`);

    // then
    assert
      .dom(
        screen.queryByRole('table', {
          name: 'Certification(s) terminée(s) Liste des candidats qui ont fini leur test de certification, triée par nom de naissance, avec un lien pour ajouter un ou plusieurs signalements le cas échéant.',
        }),
      )
      .doesNotExist();
  });

  module('when certification is V3', function () {
    module('when issue report contains IN_CHALLENGE (E1-E12) issues', function () {
      test('it should not display the delete button for these issues', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const issue1 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.IN_CHALLENGE,
        });

        const certificationReports = [
          store.createRecord('certification-report', {
            certificationCourseId: 1,
            firstName: 'Alice',
            lastName: 'Alister',
            certificationIssueReports: [issue1],
          }),
        ];

        const session = store.createRecord('session-management', {
          version: 3,
          certificationReports,
        });

        this.set('session', session);
        this.set('certificationReports', certificationReports);

        // when
        const screen = await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @session={{this.session}}
  @certificationReports={{this.certificationReports}}
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

        const issue1 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        });

        const certificationReports = [
          store.createRecord('certification-report', {
            certificationCourseId: 1,
            firstName: 'Alice',
            lastName: 'Alister',
            certificationIssueReports: [issue1],
          }),
        ];

        const session = store.createRecord('session-management', {
          version: 3,
          certificationReports,
        });

        this.set('session', session);
        this.set('certificationReports', certificationReports);

        // when
        const screen = await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @session={{this.session}}
  @certificationReports={{this.certificationReports}}
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

        const issue1 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.IN_CHALLENGE,
        });

        const issue2 = store.createRecord('certification-issue-report', {
          category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        });

        const certificationReports = [
          store.createRecord('certification-report', {
            certificationCourseId: 1,
            firstName: 'Alice',
            lastName: 'Alister',
            certificationIssueReports: [issue1, issue2],
          }),
        ];

        const session = store.createRecord('session-management', {
          version: 2,
          certificationReports,
        });

        this.set('session', session);
        this.set('certificationReports', certificationReports);

        // when
        const screen = await render(hbs`<SessionFinalization::CompletedReportsInformationStep
  @session={{this.session}}
  @certificationReports={{this.certificationReports}}
/>`);

        await click(screen.getByRole('button', { name: 'Ajouter / Supprimer' }));
        await screen.findByRole('dialog');

        // then
        assert.strictEqual(screen.queryAllByRole('button', { name: 'Supprimer le signalement' }).length, 2);
      });
    });
  });
});
