import { expect, test } from '../../../../../fixtures/certification/index.ts';
import {
  checkCertificationDetailsAndExpectSuccess,
  checkCertificationGeneralInformationAndExpectSuccess,
  checkSessionInformationAndExpectSuccess,
  getTestRef,
} from '../../../../../helpers/certification/utils.ts';
import { CERTIFICATIONS_DATA } from '../../../../../helpers/db-data.ts';
import { HomePage as AdminHomePage } from '../../../../../pages/pix-admin/index.ts';
import { SessionManagementPage } from '../../../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@snapshot', '@droit', '@results'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test for a PRO certification center, DROIT subscription. 32 wrong answers.
         - Test reaches end screen
         - Session finalized
         - Results visible in all PixAdmin screens`,
      },
    ],
  },
  async ({
    pixAppCertifiableUserPage,
    pixCertifProPage,
    enrollCandidateAndPassExam,
    pixAdminRoleCertifPage,
    getCertifiableUserData,
    waitForScoringJobToBeCompleted,
    snapshotHandler,
    testRef,
    snapshotPath,
  }) => {
    const certifiableUserData = await getCertifiableUserData('Buffy');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber } = await enrollCandidateAndPassExam({
      testRef,
      certificationKey: CERTIFICATIONS_DATA.DROIT,
      rightWrongAnswersSequence: Array(32).fill(false),
      pixAppPage: pixAppCertifiablePage,
      certifiableUserData,
    });

    await test.step(`reaches end of certification test`, async () => {
      await expect(pixAppCertifiablePage.locator('h1')).toContainText('Test terminé !');
      await expect(pixAppCertifiablePage.locator('h2')).toContainText(
        'Vos résultats, en attente de validation par les équipes Pix, seront bientôt disponibles sur votre compte Pix',
      );
      await waitForScoringJobToBeCompleted(certificationNumber);
    });

    await test.step('Finalization and scoring', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifProPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifProPage.getByText(certifiableUserData.firstName)).toBeVisible();

      await sessionFinalizationPage.finalizeSession();
    });

    const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);

    await test.step('Check all session data', async () => {
      const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
      const sessionPage = await sessionsMainPage.goToSessionWithRequiredActionPage(sessionNumber);

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
          Statut: 'Rejetée',
          Résultats: 'Non obtenu',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Droit',
        });
        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        await checkCertificationGeneralInformationAndExpectSuccess(certificationInformationPage, {
          sessionNumber,
          status: 'Rejetée',
          result: 'Non obtenu',
        });
        await checkCertificationDetailsAndExpectSuccess(certificationInformationPage, {
          status: 'Rejetée',
          nbAnsweredQuestionsOverTotal: '32/32',
          nbQuestionsOK: 0,
          nbQuestionsKO: 32,
          nbQuestionsAband: 0,
          nbValidatedTechnicalIssues: 0,
          result: 'Non obtenu',
        });
      });
    });

    await snapshotHandler.expectOrRecord(snapshotPath);
  },
);
