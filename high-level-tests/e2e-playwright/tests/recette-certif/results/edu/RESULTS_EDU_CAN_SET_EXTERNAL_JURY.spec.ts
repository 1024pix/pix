import { expect, test } from '../../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../../helpers/certification/utils.ts';
import { CERTIFICATIONS_DATA } from '../../../../helpers/db-data.ts';
import { getNowAsDDMMYYYY } from '../../../../helpers/utils.ts';
import { HomePage as AdminHomePage } from '../../../../pages/pix-admin/index.ts';
import { HomePage } from '../../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@snapshot', '@edu', '@results'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes an EDU certification test. 32 right answers.
         - Test reaches end screen
         - Session finalized
         - Results visible in all PixAdmin screens
         - Certificate visible in PixApp
         - Checks CSV results file
         - Gives an external jury result`,
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
  }) => {
    const certifiableUserData = await getCertifiableUserData('buffy.summers@example.net');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber, certificationCenterName, invigilatorOverviewPage } =
      await enrollCandidateAndPassExam({
        testRef,
        certificationKey: CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
        rightWrongAnswersSequence: Array(32).fill(true),
        pixAppPage: pixAppCertifiablePage,
        certifiableUserData,
      });
    await invigilatorOverviewPage.close();

    await test.step(`reaches end of certification test`, async () => {
      await expect(pixAppCertifiablePage.getByRole('heading', { name: 'Test terminé !', level: 2 })).toBeVisible();
      await expect(
        pixAppCertifiablePage.getByRole('heading', {
          name: 'Vos résultats, en attente de validation par les équipes Pix, seront bientôt disponibles sur votre compte Pix',
          level: 2,
        }),
      ).toBeVisible();
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

      await test.step('Check certification information', async () => {
        const certificationListPage = await sessionPage.goToCertificationListPage();
        const certificationData = await certificationListPage.getCertificationData();
        expect(certificationData.length).toBe(1);
        expect(certificationData[0]).toMatchObject({
          Prénom: certifiableUserData.firstName,
          Nom: certifiableUserData.lastName,
          Statut: 'Validée',
          Résultats: 'Admissible',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Édu 1er degré',
        });

        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
        expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
        expect(certificationGeneralInfo.status).toBe('Validée');
        expect(certificationGeneralInfo.result).toBe('Admissible');

        const certificationDetails = await certificationInformationPage.getDetails();
        expect(certificationDetails.status).toBe('Validée');
        expect(certificationDetails.result).toBe('Admissible');
        expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('32/32');
        expect(certificationDetails.nbQuestionsOK).toBe(32);
        expect(certificationDetails.nbQuestionsKO).toBe(0);
        expect(certificationDetails.nbQuestionsAband).toBe(0);
        expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
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
      expect(mainStatus).toBe('Pix+ Édu 1er degré : Admissible');
      expect(extraStatus).toBe(null);
      expect(detailsFramework).toBe(null);
      expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
      expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
      expect(result).toBe('');
      expect(hasBadge).toBe(false);
      expect(comment).toBe(null);
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

    await test.step('Setting external jury result to EXPERT', async () => {
      await test.step('Set value', async () => {
        await pixAdminRoleCertifPage.goto(process.env.PIX_ADMIN_URL!);
        const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);
        const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
        const certificationInformationPage = await sessionsMainPage.goToCertificationWithSearchBar(certificationNumber);
        await certificationInformationPage.setExternalJuryResult('Expert');
      });

      await test.step('Check result is impacted everywhere', async () => {
        await pixAdminRoleCertifPage.goto(process.env.PIX_ADMIN_URL!);
        const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);
        const sessionPage = await adminHomepage.goToSession(sessionNumber);
        const certificationListPage = await sessionPage.goToCertificationListPage();
        const certificationData = await certificationListPage.getCertificationData();
        expect(certificationData.length).toBe(1);
        expect(certificationData[0]).toMatchObject({
          Prénom: certifiableUserData.firstName,
          Nom: certifiableUserData.lastName,
          Statut: 'Validée',
          Résultats: 'Expert',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Édu 1er degré',
        });
        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
        expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
        expect(certificationGeneralInfo.status).toBe('Validée');
        expect(certificationGeneralInfo.result).toBe('Expert');

        const certificationDetails = await certificationInformationPage.getDetails();
        expect(certificationDetails.status).toBe('Validée');
        expect(certificationDetails.result).toBe('Expert');
        expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('32/32');
        expect(certificationDetails.nbQuestionsOK).toBe(32);
        expect(certificationDetails.nbQuestionsKO).toBe(0);
        expect(certificationDetails.nbQuestionsAband).toBe(0);
        expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
      });
    });

    await test.step('Setting external jury result to PENDING', async () => {
      await test.step('Set value', async () => {
        await pixAdminRoleCertifPage.goto(process.env.PIX_ADMIN_URL!);
        const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);
        const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
        const certificationInformationPage = await sessionsMainPage.goToCertificationWithSearchBar(certificationNumber);
        await certificationInformationPage.setExternalJuryResult('En attente');
      });

      await test.step('Check result is impacted everywhere', async () => {
        await pixAdminRoleCertifPage.goto(process.env.PIX_ADMIN_URL!);
        const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);
        const sessionPage = await adminHomepage.goToSession(sessionNumber);
        const certificationListPage = await sessionPage.goToCertificationListPage();
        const certificationData = await certificationListPage.getCertificationData();
        expect(certificationData.length).toBe(1);
        expect(certificationData[0]).toMatchObject({
          Prénom: certifiableUserData.firstName,
          Nom: certifiableUserData.lastName,
          Statut: 'Validée',
          Résultats: 'Admissible',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Édu 1er degré',
        });
        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
        expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
        expect(certificationGeneralInfo.status).toBe('Validée');
        expect(certificationGeneralInfo.result).toBe('Admissible');

        const certificationDetails = await certificationInformationPage.getDetails();
        expect(certificationDetails.status).toBe('Validée');
        expect(certificationDetails.result).toBe('Admissible');
        expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('32/32');
        expect(certificationDetails.nbQuestionsOK).toBe(32);
        expect(certificationDetails.nbQuestionsKO).toBe(0);
        expect(certificationDetails.nbQuestionsAband).toBe(0);
        expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
      });
    });

    await snapshotHandler.expectOrRecord(snapshotPath);
  },
);
