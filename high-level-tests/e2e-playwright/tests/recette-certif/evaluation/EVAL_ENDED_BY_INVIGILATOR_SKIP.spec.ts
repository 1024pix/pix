import { expect, test } from '../../../fixtures/certification/index.ts';
import {
  checkCertificationDetailsAndExpectSuccess,
  checkCertificationGeneralInformationAndExpectSuccess,
  checkSessionInformationAndExpectSuccess,
  getTestRef,
} from '../../../helpers/certification/utils.ts';
import { HomePage as AdminHomePage } from '../../../pages/pix-admin/index.ts';
import { ChallengePage } from '../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@evaluation'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test.
         - User stop answering at some point
         - Invigilator ends the test
         - User skips the challenge
         - User is redirected to appropriate end of test page`,
      },
    ],
  },
  async ({
    pixCertifProPage,
    enrollCandidateAndPassExam,
    pixAdminRoleCertifPage,
    getCertifiableUserData,
    pixAppCertifiableUserPage,
    testRef,
  }) => {
    const certifiableUserData = await getCertifiableUserData('Buffy');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, invigilatorOverviewPage } = await enrollCandidateAndPassExam({
      testRef,
      rightWrongAnswersSequence: Array(24).fill(true),
      pixAppPage: pixAppCertifiablePage,
      certifiableUserData,
    });

    await test.step('user stops at 25th challenge', async () => {
      await expect(pixAppCertifiablePage.getByLabel('Votre progression')).toContainText('25 / 32');
    });

    await test.step('invigilator ends the certification test', async () => {
      await invigilatorOverviewPage.endCertificationTest(certifiableUserData.firstName, certifiableUserData.lastName);
    });

    await test.step('user skips the challenge and reaches expected end of certification page', async () => {
      const challengePage = new ChallengePage(pixAppCertifiablePage);
      await challengePage.skip();
      await expect(pixAppCertifiablePage.locator('h1')).toContainText('Test terminé !');
      await expect(
        pixAppCertifiablePage.getByText(
          'Votre surveillant a mis fin à votre test de certification. Vous ne pouvez plus continuer de répondre aux questions.',
        ),
      ).toBeVisible();
    });

    await test.step('Finalization by marking a technical issue and check scoring', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifProPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifProPage.getByText(certifiableUserData.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(certifiableUserData.lastName);

      await sessionFinalizationPage.finalizeSession();
    });

    const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);

    await test.step('Check all session data', async () => {
      const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
      const sessionPage = await sessionsMainPage.goToSessionToPublishInfo(sessionNumber);

      await test.step('Check session information', async () => {
        await checkSessionInformationAndExpectSuccess(sessionPage, {
          address: `address ${testRef}`,
          room: `room ${testRef}`,
          invigilatorName: `examiner ${testRef}`,
          status: 'Finalisée',
          nbStartedCertifications: 0,
          nbIssueReportsUnsolved: 0,
          nbIssueReports: 0,
          nbCertificationsInError: 0,
        });
      });

      await pixAdminRoleCertifPage
        .getByRole('link', { name: 'Liste des certifications de la session', exact: true })
        .click();
      await test.step('Check certification information', async () => {
        const certificationListPage = await sessionPage.goToCertificationListPage();
        const certificationData = await certificationListPage.getCertificationData();
        expect(certificationData.length).toBe(1);
        expect(certificationData[0]).toMatchObject({
          Prénom: certifiableUserData.firstName,
          Nom: certifiableUserData.lastName,
          Statut: 'Terminée par le surveillant',
          Résultats: 'Expert 1 (895 Pix)',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix Cœur',
        });
        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        await checkCertificationGeneralInformationAndExpectSuccess(certificationInformationPage, {
          sessionNumber,
          status: 'Validée',
          result: 'Expert 1 (895 Pix)',
        });
        await checkCertificationDetailsAndExpectSuccess(certificationInformationPage, {
          status: 'Validée',
          nbAnsweredQuestionsOverTotal: '24/32',
          nbQuestionsOK: 24,
          nbQuestionsKO: 0,
          nbQuestionsAband: 0,
          nbValidatedTechnicalIssues: 0,
          testEndedBy: 'Le surveillant',
          abortReason: 'Problème technique',
          result: 'Expert 1 (895 Pix)',
        });
      });
    });
  },
);
