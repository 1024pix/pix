import { expect, test } from '../../../../fixtures/certification/index.ts';
import {
  checkCertificationDetailsAndExpectSuccess,
  checkCertificationGeneralInformationAndExpectSuccess,
  checkSessionInformationAndExpectSuccess,
} from '../../../../helpers/certification/utils.ts';
import { getTestRef } from '../../../../helpers/certification/utils.ts';
import { CERTIFICATIONS_DATA } from '../../../../helpers/db-data.ts';
import { getNowAsDDMMYYYY } from '../../../../helpers/utils.ts';
import { HomePage as AdminHomePage } from '../../../../pages/pix-admin/index.ts';
import { HomePage } from '../../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@snapshot', '@clea', '@results'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test for a PRO certification center, CLEA subscription. 32 wrong answers.
         - Test reaches end screen
         - Session finalized
         - Results visible in all PixAdmin screens
         - Certificate visible in PixApp
         - Checks CSV results file`,
      },
    ],
  },
  async ({
    getCertifiableUserData,
    pixCertifProPage,
    enrollCandidateAndPassExam,
    pixAdminRoleCertifPage,
    pixAppCertifiableUserPage,
    waitForScoringJobToBeCompleted,
    snapshotHandler,
    testRef,
    snapshotPath,
    csvResultPath,
  }) => {
    const certifiableUserData = await getCertifiableUserData('Buffy');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber, certificationCenterName } = await enrollCandidateAndPassExam({
      testRef,
      rightWrongAnswersSequence: Array(32).fill(false),
      certificationKey: CERTIFICATIONS_DATA.CLEA,
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
          Statut: 'Rejetée',
          Résultats: '0 Pix',
          'Signalements impactants non résolus': '',
          'Certification passée': 'PIX / CléA Numérique',
        });
        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        await checkCertificationGeneralInformationAndExpectSuccess(certificationInformationPage, {
          sessionNumber,
          status: 'Rejetée',
          result: '0 Pix',
        });
        const cleaResult = await certificationInformationPage.getCleaResult();
        expect(cleaResult).toBe('Rejetée');
        await checkCertificationDetailsAndExpectSuccess(certificationInformationPage, {
          status: 'Rejetée',
          nbAnsweredQuestionsOverTotal: '32/32',
          nbQuestionsOK: 0,
          nbQuestionsKO: 32,
          nbQuestionsAband: 0,
          nbValidatedTechnicalIssues: 0,
          result: '0 Pix',
        });
      });
    });

    await test.step('Publish session', async () => {
      const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
      await sessionsMainPage.publishSession(sessionNumber);
    });

    await test.step('User checks their certification result', async () => {
      await pixAppCertifiablePage.goto(process.env.PIX_APP_URL as string);
      const homePage = new HomePage(pixAppCertifiablePage);
      const certificateListPage = await homePage.goToMyCertificates();
      const { mainStatus, extraStatus, detailsFramework, certificationCenter, examDate, result, comment } =
        await certificateListPage.getCertificateData(certificationNumber);
      expect(mainStatus).toBe('Certification Pix : Non-obtenue');
      expect(extraStatus).toBe('CLéA Numérique : Non-obtenue');
      expect(detailsFramework).toBe(null);
      expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
      expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
      expect(result).toBe('- PIX');
      expect(comment).toBe(
        "Commentaire : Les résultats obtenus ne permettent pas encore la délivrance de la certification Pix. Vous avez besoin de progresser pour être plus à l'aise avec votre environnement numérique et pouvoir valoriser vos compétences.",
      );
    });

    await test.step('Checking CSV result file content', async () => {
      const sessionPage = await adminHomepage.goToSession(sessionNumber);
      const csvBuffer = await sessionPage.downloadCsvResultFile();

      await snapshotHandler.compareCsvOrRecord(csvBuffer, csvResultPath, [
        'Date de passage de la certification',
        'Session',
        'Numéro de certification',
        'Centre de certification',
      ]);
    });
    await snapshotHandler.expectOrRecord(snapshotPath);
  },
);
