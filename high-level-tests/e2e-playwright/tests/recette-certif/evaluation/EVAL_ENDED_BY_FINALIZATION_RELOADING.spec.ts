import { expect, test } from '../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../helpers/certification/utils.ts';
import { HomePage as AdminHomePage } from '../../../pages/pix-admin/index.ts';
import { SessionManagementPage } from '../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@evaluation', '@snapshot'],
    annotation: [
      {
        type: 'scenario',
        description: `User takes a certification test.
         - User stop answering at some point
         - Session finalized by marking an abort reason
         - User reloads
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
    snapshotHandler,
    snapshotPath,
    testRef,
  }) => {
    const certifiableUserData = await getCertifiableUserData('buffy.summers@example.net');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber } = await enrollCandidateAndPassExam({
      testRef,
      rightWrongAnswersSequence: Array(24).fill(true),
      pixAppPage: pixAppCertifiablePage,
      certifiableUserData,
    });

    await test.step('user stops at 25th challenge', async () => {
      await expect(pixAppCertifiablePage.getByTestId('pw-certification-progression')).toContainText('25 / 32');
    });

    await test.step('Finalization by marking a technical issue and check scoring', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifProPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifProPage.getByText(certifiableUserData.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(certifiableUserData.lastName);

      await sessionFinalizationPage.finalizeSession();
    });

    await test.step('user reloads the page and reaches expected end of certification page', async () => {
      await pixAppCertifiablePage.reload();
      await expect(pixAppCertifiablePage.getByRole('heading', { name: 'Test terminé !', level: 2 })).toBeVisible();
      await expect(
        pixAppCertifiablePage.getByText(
          'La session a été finalisée par votre centre de certification. Vous ne pouvez plus continuer de répondre aux questions.',
        ),
      ).toBeVisible();
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
        expect(sessionNumber).toBe(certificationGeneralInfo.sessionNumber);
        snapshotHandler.push('adminCertificationInfo_status', certificationGeneralInfo.status ?? null);
        snapshotHandler.push('adminCertificationInfo_results', certificationGeneralInfo.result ?? null);

        const certificationDetails = await certificationInformationPage.getDetails();
        expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('24/32');
        expect(certificationDetails.nbQuestionsOK).toBe(24);
        expect(certificationDetails.nbQuestionsKO).toBe(0);
        expect(certificationDetails.nbQuestionsAband).toBe(0);
        expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
        expect(certificationDetails.testEndedBy).toBe('Finalisation session');
        expect(certificationDetails.abortReason).toBe('Problème technique');
        snapshotHandler.push('adminCertificationDetails_result', certificationDetails.result ?? null);
        snapshotHandler.push('adminCertificationDetails_status', certificationDetails.status ?? null);
      });
    });

    await snapshotHandler.expectOrRecord(snapshotPath);
  },
);
