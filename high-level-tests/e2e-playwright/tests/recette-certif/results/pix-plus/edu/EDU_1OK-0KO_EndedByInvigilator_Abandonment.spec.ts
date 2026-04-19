import { expect, test } from '../../../../../fixtures/certification/index.ts';
import {
  checkCertificationDetailsAndExpectSuccess,
  checkCertificationGeneralInformationAndExpectSuccess,
  checkSessionInformationAndExpectSuccess,
  getTestRef,
} from '../../../../../helpers/certification/utils.ts';
import { CERTIFICATIONS_DATA } from '../../../../../helpers/db-data.ts';
import { getNowAsDDMMYYYY } from '../../../../../helpers/utils.ts';
import { HomePage as AdminHomePage } from '../../../../../pages/pix-admin/index.ts';
import { HomePage } from '../../../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@snapshot', '@edu', '@results'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test for a PRO certification center, EDU subscription. Only one right answer.
         - Test ended by invigilator
         - Abort reason : abandonment
         - Results visible in all PixAdmin screens
         - Certificate visible in PixApp
         - Checks CSV results file
         - Checks that external jury result cannot be set`,
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
    const certifiableUserData = await getCertifiableUserData('Buffy');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, invigilatorOverviewPage, certificationNumber, certificationCenterName } =
      await enrollCandidateAndPassExam({
        testRef,
        certificationKey: CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
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

    await test.step('Finalization by marking an abandonment and scoring', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifProPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifProPage.getByText(certifiableUserData.lastName)).toBeVisible();
      await sessionFinalizationPage.markAbandonmentFor(certifiableUserData.lastName);
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
          Résultats: 'Non admissible',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Édu 1er degré',
        });
        const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
          certifiableUserData.firstName,
        );
        await checkCertificationGeneralInformationAndExpectSuccess(certificationInformationPage, {
          sessionNumber,
          status: 'Rejetée',
          result: 'Non admissible',
        });
        await checkCertificationDetailsAndExpectSuccess(certificationInformationPage, {
          status: 'Rejetée',
          nbAnsweredQuestionsOverTotal: '1/32',
          nbQuestionsOK: 1,
          nbQuestionsKO: 0,
          nbQuestionsAband: 0,
          nbValidatedTechnicalIssues: 0,
          testEndedBy: 'Le surveillant',
          abortReason: 'Abandon : Manque de temps ou départ prématuré',
          result: 'Non admissible',
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
      expect(mainStatus).toBe('Pix+ Édu 1er degré : Non admissible');
      expect(extraStatus).toBe(null);
      expect(detailsFramework).toBe(null);
      expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
      expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
      expect(result).toBe('-');
      expect(comment).toBe(
        'Commentaire : Le nombre de questions répondues pendant votre test de certification est insuffisant et ne nous permet pas de vous délivrer une certification.',
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

    await test.step('Cannot set external jury result', async () => {
      await pixAdminRoleCertifPage.goto(process.env.PIX_ADMIN_URL!);
      const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);
      const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
      await sessionsMainPage.goToCertificationWithSearchBar(certificationNumber);
      await expect(pixAdminRoleCertifPage.getByText('Résultats de la certification Pix+ Edu')).not.toBeVisible();
    });

    await snapshotHandler.expectOrRecord(snapshotPath);
  },
);
