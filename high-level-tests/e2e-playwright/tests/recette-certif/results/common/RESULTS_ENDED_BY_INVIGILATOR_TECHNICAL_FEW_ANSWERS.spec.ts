import { expect, test } from '../../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../../helpers/certification/utils.ts';
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
        description: `User takes a certification test. Only one right answer.
         - Test ended by invigilator
         - Abort reason : technical issue
         - Results visible in all PixAdmin screens
         - Certificate visible in PixApp
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
    snapshotHandler,
    testRef,
    snapshotPath,
    csvResultPath,
  }) => {
    const certifiableUserData = await getCertifiableUserData('buffy.summers@example.net');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber, certificationCenterName, invigilatorOverviewPage } =
      await enrollCandidateAndPassExam({
        testRef,
        rightWrongAnswersSequence: [true],
        pixAppPage: pixAppCertifiablePage,
        certifiableUserData,
      });

    await test.step('user stops at second challenge', async () => {
      await expect(pixAppCertifiablePage.getByLabel('Votre progression')).toContainText('2 / 32');
    });

    await test.step('invigilator ends the certification test', async () => {
      await invigilatorOverviewPage.endCertificationTest(certifiableUserData.firstName, certifiableUserData.lastName);
    });
    await invigilatorOverviewPage.close();

    await test.step('Finalization by marking a technical issue and scoring', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifProPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifProPage.getByText(certifiableUserData.lastName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(certifiableUserData.lastName);
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
      await test.step('Check certification information', async () => {
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
        expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('1/32');
        expect(certificationDetails.nbQuestionsOK).toBe(1);
        expect(certificationDetails.nbQuestionsKO).toBe(0);
        expect(certificationDetails.nbQuestionsAband).toBe(0);
        expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
        expect(certificationDetails.testEndedBy).toBe('Le surveillant');
        expect(certificationDetails.abortReason).toBe('Problème technique');
        snapshotHandler.push('adminCertificationDetails_result', certificationDetails.result ?? null);
        snapshotHandler.push('adminCertificationDetails_status', certificationDetails.status ?? null);
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
      const {
        mainStatus,
        extraStatus,
        detailsFramework,
        certificationCenter,
        examDate,
        result,
        comment,
        hasBadge: hasBadgeInList,
        badgeSrc: badgeSrcInList,
      } = await certificateListPage.getCertificateData(certificationNumber);
      expect(mainStatus).toBe('Certification Pix : Annulée');
      expect(extraStatus).toBe(null);
      expect(detailsFramework).toBe(null);
      expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
      expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
      expect(comment).toBe(
        "Commentaire : Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification, a/ont affecté la qualité du test de certification. En raison du trop grand nombre de questions auxquelles vous n'avez pas pu répondre dans de bonnes conditions, nous ne sommes malheureusement pas en mesure de calculer un score fiable et de fournir un certificat. La certification est annulée, le prescripteur de votre certification (le cas échéant), en est informé.",
      );
      snapshotHandler.push('appCertificationListInfo_result', result);
      snapshotHandler.push('appCertificationListInfo_hasBadge', `${hasBadgeInList}`);
      snapshotHandler.push('appCertificationListInfo_badgeSrc', badgeSrcInList);
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
