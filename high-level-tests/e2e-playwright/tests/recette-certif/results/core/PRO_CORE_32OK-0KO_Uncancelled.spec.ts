import { expect, test } from '../../../../fixtures/certification/index.ts';
import { changeCandidateAnswers } from '../../../../helpers/certification/db.ts';
import {
  checkCertificationDetailsAndExpectSuccess,
  checkCertificationGeneralInformationAndExpectSuccess,
  checkSessionInformationAndExpectSuccess,
  getTestRef,
} from '../../../../helpers/certification/utils.ts';
import { getNowAsDDMMYYYY } from '../../../../helpers/utils.ts';
import { HomePage as AdminHomePage } from '../../../../pages/pix-admin/index.ts';
import { HomePage } from '../../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@snapshot', '@core', '@results'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test for a PRO certification center, CORE subscription. 32 right answers.
         - Test reaches end screen
         - Session finalized
         - Results visible in all PixAdmin screens
         - Cancel certification
         - Alter answers
         - Uncancel certification
         - Certificate visible in PixApp
         - Checks PDF certificate
         - Checks CSV results file`,
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
    csvResultPath,
    certificateBasePath,
  }) => {
    const certifiableUserData = await getCertifiableUserData('Buffy');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber, certificationCenterName } = await enrollCandidateAndPassExam({
      testRef,
      rightWrongAnswersSequence: Array(32).fill(true),
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
      const certificationInformationPage = await test.step('Check certification information', async () => {
        const certificationListPage = await sessionPage.goToCertificationListPage();
        const certificationData = await certificationListPage.getCertificationData();
        expect(certificationData.length).toBe(1);
        expect(certificationData[0]).toMatchObject({
          Prénom: certifiableUserData.firstName,
          Nom: certifiableUserData.lastName,
          Statut: 'Validée',
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
          nbAnsweredQuestionsOverTotal: '32/32',
          nbQuestionsOK: 32,
          nbQuestionsKO: 0,
          nbQuestionsAband: 0,
          nbValidatedTechnicalIssues: 0,
          result: 'Expert 1 (895 Pix)',
        });
        return certificationInformationPage;
      });
      await test.step('Cancel and uncancel certification to check for scoring', async () => {
        await test.step('Cancel certification', async () => {
          await certificationInformationPage.cancelCertification();
          await checkCertificationGeneralInformationAndExpectSuccess(certificationInformationPage, {
            sessionNumber,
            status: 'Annulée',
            result: 'Expert 1 (895 Pix)',
          });
        });

        await test.step('Alter candidate answers directly in BDD to have half right, half wrong, to demonstrate re-scoring', async () => {
          await changeCandidateAnswers(parseInt(certificationNumber), [true, false]);
        });

        await test.step('Uncancel certification', async () => {
          await certificationInformationPage.uncancelCertification();
          await checkCertificationGeneralInformationAndExpectSuccess(certificationInformationPage, {
            sessionNumber,
            status: 'Validée',
            result: 'Expert 1 (806 Pix)',
          });
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
      expect(mainStatus).toBe('Certification Pix : Obtenue');
      expect(extraStatus).toBe(null);
      expect(detailsFramework).toBe(null);
      expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
      expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
      expect(result).toBe('806 PIX');
      expect(comment).toBe(null);
      const certificationResultPage = await certificateListPage.goToCertificateDetails(certificationNumber);
      const { pixScoreObtained, pixLevelReached } = await certificationResultPage.getResultInfo();
      expect(pixScoreObtained).toEqual('PIX 806 CERTIFIÉS');
      expect(pixLevelReached).toEqual('Vous avez atteint le niveau Expert 1 de la Certification Pix !');
      const certificatePdfBuffer = await certificationResultPage.downloadCertificate();

      await snapshotHandler.comparePdfOrRecord(certificatePdfBuffer, certificateBasePath);
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
