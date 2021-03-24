import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createCertificationPointOfContactWithTermsOfServiceAccepted, authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Finalization', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;
  let session;

  hooks.beforeEach(() => {
    certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
    const certificationCenterId = certificationPointOfContact.certificationCenterId;
    session = server.create('session', { certificationCenterId });

    const certificationReports = server.createList('certification-report', 2, { hasSeenEndTestScreen: false });
    session.update({ certificationReports });
  });

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When certificationPointOfContact is not logged in', () => {

    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/finalisation`);

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is logged in', (hooks) => {

    hooks.beforeEach(async () => {
      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should be accessible for an authenticated certificationPointOfContact', async function(assert) {
      // when
      await visit(`/sessions/${session.id}/finalisation`);

      // then
      assert.equal(currentURL(), `/sessions/${session.id}/finalisation`);
    });

    module('When certificationPointOfContact click on "Finaliser" button', () => {

      module('when there is no certification issue reports', () => {
        test('it should show "Ajouter ?" button', async function(assert) {
          // given
          const expectedText = 'Ajouter ?';
          const certificationReportsWithoutIssueReport = server.create('certification-report', { certificationCourseId: 1 });
          const certificationReports = [certificationReportsWithoutIssueReport];
          session.update({ certificationReports });

          // when
          await visit(`/sessions/${session.id}/finalisation`);

          // then
          assert.dom('[data-test-id="finalization-report-certification-issue-reports_1"] .button--showed-as-link').hasText(expectedText);
        });
      });

      module('when we add a certification issue report', () => {
        test('it should show "Ajouter / modifier" button', async function(assert) {
          // given
          const expectedTextWithIssueReport = 'Ajouter / modifier';
          const expectedTextWithoutIssueReport = 'Ajouter ?';
          const BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1 = '[data-test-id="finalization-report-certification-issue-reports_1"] .button--showed-as-link';
          const BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_2 = '[data-test-id="finalization-report-certification-issue-reports_2"] .button--showed-as-link';
          const RADIO_BTN_OF_TYPE_OTHER = '#input-radio-for-category-other';
          const TEXT_AREA_OF_TYPE_OTHER = '#text-area-for-category-other';
          const VALIDATE_CERTIFICATION_ISSUE_REPORT = '.add-issue-report-modal__actions .button.button--extra-thin';

          const certificationReportsWithoutCertificationIssueReport = server.create('certification-report', { certificationCourseId: 1 });
          const certificationReportsWithCertificationIssueReport = server.create('certification-report', { certificationCourseId: 2 });

          const certificationReports = [certificationReportsWithCertificationIssueReport, certificationReportsWithoutCertificationIssueReport];
          session.update({ certificationReports });

          // when
          await visit(`/sessions/${session.id}/finalisation`);
          await click(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_2);
          await click(RADIO_BTN_OF_TYPE_OTHER);
          await fillIn(TEXT_AREA_OF_TYPE_OTHER, 'Coucou');
          await click(VALIDATE_CERTIFICATION_ISSUE_REPORT);

          // then
          assert.dom(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1).hasText(expectedTextWithoutIssueReport);
          assert.dom(BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_2).hasText(expectedTextWithIssueReport);
        });
      });

      module('when we delete a certification issue report', () => {
        test('it should show the remaining count of issue reports', async function(assert) {
          // given
          const BTN_ADD_ISSUE_REPORT_FOR_CERTIFICATION_COURSE_1 = '[data-test-id="finalization-report-certification-issue-reports_1"] .button--showed-as-link';

          const certificationReport = server.create('certification-report', { certificationCourseId: 1 });
          const certificationIssueReport1 = server.create('certification-issue-report', { certificationReportId: certificationReport.id });
          const certificationIssueReport2 = server.create('certification-issue-report', { certificationReportId: certificationReport.id });

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
    });
  });
});

