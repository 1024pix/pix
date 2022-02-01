import { module, test } from 'qunit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { visit } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const CONFIRMATION_TEXT = 'Vous êtes sur le point de finaliser cette session.';

module('Acceptance | Session Finalization', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let allowedCertificationCenterAccess;
  let certificationPointOfContact;
  let session;

  hooks.beforeEach(function () {
    allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
      isAccessBlockedCollege: false,
      isAccessBlockedLycee: false,
      isAccessBlockedAEFE: false,
      isAccessBlockedAgri: false,
      hasEndTestScreenRemovalEnabled: false,
    });
    certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
      pixCertifTermsOfServiceAccepted: true,
    });
    const certificationReports = server.createList('certification-report', 2, {
      hasSeenEndTestScreen: false,
      isCompleted: true,
    });
    session = server.create('session', {
      certificationCenterId: allowedCertificationCenterAccess.id,
      certificationReports,
    });
    session.update({ certificationReports });
  });

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      // when
      await visit(`/sessions/${session.id}/finalisation`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateSession(certificationPointOfContact.id);
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${session.id}/finalisation`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    test('it should be accessible for an authenticated certificationPointOfContact', async function (assert) {
      // when
      await visit(`/sessions/${session.id}/finalisation`);

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/finalisation`);
    });

    test('it should display the end screen column when the center has no access to the supervisor space', async function (assert) {
      // when
      server.create('feature-toggle', { isEndTestScreenRemovalEnabled: true });
      const screen = await visit(`/sessions/${session.id}/finalisation`);

      // then
      assert.dom(screen.queryByText('Écran de fin du test vu')).exists();
    });

    module('When certificationPointOfContact click on "Finaliser" button', function () {
      module('when there is no certification issue reports', function () {
        test('it should show "Ajouter ?" button', async function (assert) {
          // given
          const expectedText = 'Ajouter ?';
          const certificationReportsWithoutIssueReport = server.create('certification-report', {
            certificationCourseId: 1,
          });
          const certificationReports = [certificationReportsWithoutIssueReport];
          session.update({ certificationReports });

          // when
          await visit(`/sessions/${session.id}/finalisation`);

          // then
          assert
            .dom('[data-test-id="finalization-report-certification-issue-reports_1"] .button--showed-as-link')
            .hasText(expectedText);
        });
      });

      module('when we add a certification issue report', function () {
        test('it should show "Ajouter / modifier" button', async function (assert) {
          // given
          const expectedTextWithIssueReport = 'Ajouter / modifier';
          const expectedTextWithoutIssueReport = 'Ajouter ?';
          const BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1 =
            '[data-test-id="finalization-report-certification-issue-reports_1"] .button--showed-as-link';
          const BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_2 =
            '[data-test-id="finalization-report-certification-issue-reports_2"] .button--showed-as-link';
          const RADIO_BTN_OF_TYPE_OTHER = '#input-radio-for-category-other';
          const TEXT_AREA_OF_TYPE_OTHER = '#text-area-for-category-other';

          const certificationReportsWithoutCertificationIssueReport = server.create('certification-report', {
            certificationCourseId: 1,
          });
          const certificationReportsWithCertificationIssueReport = server.create('certification-report', {
            certificationCourseId: 2,
          });

          const certificationReports = [
            certificationReportsWithCertificationIssueReport,
            certificationReportsWithoutCertificationIssueReport,
          ];
          session.update({ certificationReports });

          // when
          await visit(`/sessions/${session.id}/finalisation`);
          await click(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_2);
          await click(RADIO_BTN_OF_TYPE_OTHER);
          await fillIn(TEXT_AREA_OF_TYPE_OTHER, 'Coucou');
          await clickByLabel('Ajouter le signalement');

          // then
          assert.dom(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1).hasText(expectedTextWithoutIssueReport);
          assert.dom(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_2).hasText(expectedTextWithIssueReport);
        });
      });

      module('when we delete a certification issue report', function () {
        test('it should show the remaining count of issue reports', async function (assert) {
          // given
          const BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1 =
            '[data-test-id="finalization-report-certification-issue-reports_1"] .button--showed-as-link';

          const certificationReport = server.create('certification-report', { certificationCourseId: 1 });
          const certificationIssueReport1 = server.create('certification-issue-report', {
            certificationReportId: certificationReport.id,
          });
          const certificationIssueReport2 = server.create('certification-issue-report', {
            certificationReportId: certificationReport.id,
          });

          const certificationIssueReports = [certificationIssueReport1, certificationIssueReport2];
          certificationReport.update({ certificationIssueReports });
          session.update({ certificationReports: [certificationReport] });

          // when
          await visit(`/sessions/${session.id}/finalisation`);
          await click(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1);
          await click('button[aria-label="Supprimer le signalement"]');
          await click('button[aria-label="Fermer"]');

          // then
          assert.contains('1 signalement');
        });
      });

      module('when there is completed report', function () {
        module('when end test screen has been seen', function () {
          test('it should not display end test screen warning', async function (assert) {
            // given
            const certificationReport = server.create('certification-report', {
              hasSeenEndTestScreen: true,
              isCompleted: true,
              abortReason: 'technical',
            });

            session.update({ certificationReports: [certificationReport] });

            // when
            await visit(`/sessions/${session.id}/finalisation`);
            await clickByLabel('Finaliser');

            // then
            assert.contains(CONFIRMATION_TEXT);
            assert.notContains('La case "Écran de fin du test vu" n\'est pas cochée pour 1 candidat(s)');
          });
        });

        module('when end test screen has not been seen', function () {
          test('it should display end test screen warning', async function (assert) {
            // given
            const certificationReport = server.create('certification-report', {
              hasSeenEndTestScreen: false,
              isCompleted: true,
              abortReason: 'technical',
            });

            session.update({ certificationReports: [certificationReport] });

            // when
            await visit(`/sessions/${session.id}/finalisation`);
            await clickByLabel('Finaliser');

            // then
            assert.contains(CONFIRMATION_TEXT);
            assert.contains('La case "Écran de fin du test vu" n\'est pas cochée pour 1 candidat(s)');
          });
        });
      });

      module('when there is no uncompleted report', function () {
        test('it should not show the uncompleted reports table', async function (assert) {
          // given
          const certificationReport = server.create('certification-report', { isCompleted: true });
          session.update({ certificationReports: [certificationReport] });

          // when
          await visit(`/sessions/${session.id}/finalisation`);

          // then
          assert.notContains("Ces candidats n'ont pas fini leur test de certification");
        });
      });

      module('when there are uncompleted reports', function () {
        module('when end test screen has not been seen', function () {
          module('when certification center is not in the whitelist', function () {
            test('it should display end test screen warning', async function (assert) {
              // given
              const certificationReport = server.create('certification-report', {
                hasSeenEndTestScreen: false,
                isCompleted: true,
                abortReason: 'technical',
              });

              session.update({ certificationReports: [certificationReport] });

              // when
              await visit(`/sessions/${session.id}/finalisation`);
              await clickByLabel('Finaliser');

              // then
              assert.contains(CONFIRMATION_TEXT);
              assert.contains('La case "Écran de fin du test vu" n\'est pas cochée pour 1 candidat(s)');
            });
          });

          module('when certification center is in the whitelist', function () {
            test('it should not display end test screen warning', async function (assert) {
              // given
              const certificationReport = server.create('certification-report', {
                hasSeenEndTestScreen: false,
                isCompleted: true,
                abortReason: 'technical',
              });

              allowedCertificationCenterAccess.update({
                hasEndTestScreenRemovalEnabled: true,
              });

              session.update({ certificationReports: [certificationReport] });

              // when
              await visit(`/sessions/${session.id}/finalisation`);
              await clickByLabel('Finaliser');

              // then
              assert.contains(CONFIRMATION_TEXT);
              assert.notContains('La case "Écran de fin du test vu" n\'est pas cochée pour 1 candidat(s)');
            });
          });
        });

        test('it should not show the completed reports table', async function (assert) {
          // given
          const certificationReport = server.create('certification-report', { isCompleted: false, abortReason: null });
          session.update({ certificationReports: [certificationReport] });

          // when
          await visit(`/sessions/${session.id}/finalisation`);

          // then
          assert.notContains('Certification(s) terminée(s)\n');
          assert.notContains('Écran de fin du test vu\n');
        });

        test('it should show the uncompleted reports table', async function (assert) {
          // given
          const certificationReport = server.create('certification-report', { isCompleted: false });
          session.update({ certificationReports: [certificationReport] });

          // when
          await visit(`/sessions/${session.id}/finalisation`);

          // then
          assert.contains("Ces candidats n'ont pas fini leur test de certification");
        });

        module('without any selected reason', function () {
          test('it should invalidate the form', async function (assert) {
            // given
            const certificationReport = server.create('certification-report', {
              isCompleted: false,
              abortReason: null,
            });
            session.update({ certificationReports: [certificationReport] });

            // when
            await visit(`/sessions/${session.id}/finalisation`);

            await clickByLabel('Finaliser');

            // then
            assert.notContains(CONFIRMATION_TEXT);
          });
        });

        module('with a selected reason', function () {
          test('it should validate the form', async function (assert) {
            // given
            const certificationReport = server.create('certification-report', {
              isCompleted: false,
              abortReason: 'technical',
            });
            session.update({ certificationReports: [certificationReport] });

            // when
            await visit(`/sessions/${session.id}/finalisation`);

            await clickByLabel('Finaliser');

            // then
            assert.contains(CONFIRMATION_TEXT);
          });
        });
      });
    });
  });
});
