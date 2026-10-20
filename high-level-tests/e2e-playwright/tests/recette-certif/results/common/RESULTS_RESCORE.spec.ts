import { expect, test } from '../../../../fixtures/certification/index.ts';
import { changeCandidateAnswers } from '../../../../helpers/certification/db.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../../helpers/certification/utils.ts';
import { HomePage as AdminHomePage } from '../../../../pages/pix-admin/index.ts';
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
         - Rescoring certification by altering answers
         - Check changes on PixAdmin`,
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
  }) => {
    const certifiableUserData = await getCertifiableUserData('buffy.summers@example.net');
    const pixAppCertifiablePage = await pixAppCertifiableUserPage(certifiableUserData);
    const { sessionNumber, certificationNumber, invigilatorOverviewPage } = await enrollCandidateAndPassExam({
      testRef,
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
      await test.step('Rescore certification and check for scoring', async () => {
        await test.step('Rescore certification to demonstrate idempotency', async () => {
          await certificationInformationPage.rescoreCertification();
          const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
          expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
          snapshotHandler.push('adminCertificationInfo_status_rescore_idem', certificationGeneralInfo.status ?? null);
          snapshotHandler.push('adminCertificationInfo_results_rescore_idem', certificationGeneralInfo.result ?? null);
        });

        await test.step('Alter candidate answers directly in BDD to have half right, half wrong, to demonstrate re-scoring', async () => {
          await changeCandidateAnswers(parseInt(certificationNumber), [true, false]);
        });

        await test.step('Rescore certification twice in a row to demonstrate idempotency', async () => {
          await certificationInformationPage.rescoreCertification();
          await certificationInformationPage.page.reload();
          let certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
          expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
          snapshotHandler.push('adminCertificationInfo_status_rescore_alter1', certificationGeneralInfo.status ?? null);
          snapshotHandler.push(
            'adminCertificationInfo_results_rescore_alter1',
            certificationGeneralInfo.result ?? null,
          );

          await certificationInformationPage.rescoreCertification();
          await certificationInformationPage.page.reload();
          certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
          expect(certificationGeneralInfo.sessionNumber).toBe(sessionNumber);
          snapshotHandler.push('adminCertificationInfo_status_rescore_alter2', certificationGeneralInfo.status ?? null);
          snapshotHandler.push(
            'adminCertificationInfo_results_rescore_alter2',
            certificationGeneralInfo.result ?? null,
          );
        });
      });
    });

    await snapshotHandler.expectOrRecord(snapshotPath);
  },
);
