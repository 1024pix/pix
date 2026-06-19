import { expect, test } from '../../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../../helpers/certification/utils.ts';
import { getNowAsDDMMYYYY } from '../../../../helpers/utils.ts';
import { HomePage as AdminHomePage } from '../../../../pages/pix-admin/index.ts';
import { HomePage } from '../../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@core', '@results', '@snapshot'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test. 32 right answers.
         - Test reaches end screen
         - Session finalized
         - Results visible in all PixAdmin screens
         - Cancel certification
         - Uncancel certification`,
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
    snapshotPath,
    testRef,
    csvResultPath,
  }) => {
    const certifiableUserData = await getCertifiableUserData('buffy.summers@example.net');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber, invigilatorOverviewPage, certificationCenterName } =
      await enrollCandidateAndPassExam({
        testRef,
        rightWrongAnswersSequence: Array(32).fill(true),
        pixAppPage: pixAppCertifiablePage,
        certifiableUserData,
      });
    await invigilatorOverviewPage.close();

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
      await sessionFinalizationPage.close();
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
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix Cœur',
        });
        snapshotHandler.push('adminCertificationListInfo_status', certificationData[0]['Statut']);
        snapshotHandler.push('adminCertificationListInfo_results', certificationData[0]['Résultats']);

        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
        expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
        snapshotHandler.push('adminCertificationInfo_status', certificationGeneralInfo.status ?? null);
        snapshotHandler.push('adminCertificationInfo_results', certificationGeneralInfo.result ?? null);

        const certificationDetails = await certificationInformationPage.getDetails();
        expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('32/32');
        expect(certificationDetails.nbQuestionsOK).toBe(32);
        expect(certificationDetails.nbQuestionsKO).toBe(0);
        expect(certificationDetails.nbQuestionsAband).toBe(0);
        expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
        snapshotHandler.push('adminCertificationDetails_result', certificationDetails.result ?? null);
        snapshotHandler.push('adminCertificationDetails_status', certificationDetails.status ?? null);
        return certificationInformationPage;
      });

      await test.step('Cancel and uncancel certification to check for scoring', async () => {
        await test.step('Cancel certification', async () => {
          await certificationInformationPage.cancelCertification();
          const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
          expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
          expect(certificationGeneralInfo.status).toBe('Annulée par le jury');
          expect(certificationGeneralInfo.result).toBe('Pix');
        });

        await test.step('Uncancel certification', async () => {
          await certificationInformationPage.uncancelCertification();
          const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
          expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
          snapshotHandler.push('adminCertificationInfo_status_uncancel', certificationGeneralInfo.status ?? null);
          snapshotHandler.push('adminCertificationInfo_results_uncancel', certificationGeneralInfo.result ?? null);
        });

        await test.step('Cancel certification again', async () => {
          await certificationInformationPage.cancelCertification();
          const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
          expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
          expect(certificationGeneralInfo.status).toBe('Annulée par le jury');
          expect(certificationGeneralInfo.result).toBe('Pix');
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
      const { mainStatus, extraStatus, detailsFramework, certificationCenter, examDate, result, comment, hasBadge } =
        await certificateListPage.getCertificateData(certificationNumber);
      expect(mainStatus).toBe('Certification Pix : Annulée');
      expect(extraStatus).toBe(null);
      expect(detailsFramework).toBe(null);
      expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
      expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
      expect(result).toBe('- PIX');
      expect(hasBadge).toBe(false);
      expect(comment).toBe(
        'Commentaire : Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification, a/ont affecté la qualité du test de certification. La certification est annulée, le prescripteur de votre certification (le cas échéant), en est informé.',
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
