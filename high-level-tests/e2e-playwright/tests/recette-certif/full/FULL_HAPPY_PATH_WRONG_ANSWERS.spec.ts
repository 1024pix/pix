import { expect, test } from '../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../helpers/certification/utils.ts';
import { CERTIFICATIONS_DATA } from '../../../helpers/db-data.ts';
import { getNowAsDDMMYYYY } from '../../../helpers/utils.ts';
import { CertificationListPage, HomePage as AdminHomePage } from '../../../pages/pix-admin/index.ts';
import { HomePage } from '../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../pages/pix-certif/index.ts';
import { allTestData } from './wrong-answers-data.ts';

test.describe('Happy paths on all certifications, 32 wrong answers', () => {
  for (const testData of allTestData) {
    test(
      `${getTestRef(import.meta.url)}_${testData.certification}`,
      {
        tag: ['@snapshot', '@full', '@wrongAnswersOnly', testData.tag],
        annotation: [
          {
            type: 'scenario',
            description: `User takes a certification test for ${testData.certification}.
         - Test reaches end screen
         - Session finalized
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
            rightWrongAnswersSequence: Array(32).fill(false),
            certificationKey: testData.certification,
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
          await test.step('Check certification information', async () => {
            let certificationListPage: CertificationListPage;
            await test.step('Check certification info on list', async () => {
              certificationListPage = await sessionPage.goToCertificationListPage();
              const certificationData = await certificationListPage.getCertificationData();
              expect(certificationData.length).toBe(1);
              expect(certificationData[0]).toMatchObject({
                Prénom: certifiableUserData.firstName,
                Nom: certifiableUserData.lastName,
                'Signalements impactants non résolus': '',
                'Certification passée': testData.adminCertificationListInfo.takenCertification,
              });
              snapshotHandler.push('adminCertificationListInfo_status', certificationData[0]['Statut']);
              snapshotHandler.push('adminCertificationListInfo_results', certificationData[0]['Résultats']);
              return certificationListPage;
            });

            await test.step('Check certification info on certif page', async () => {
              const certificationInformationPage = await certificationListPage.goToCertificationInfoPage(
                certifiableUserData.firstName,
              );
              const certificationGeneralInfo = await certificationInformationPage.getGeneralInfo();
              expect(sessionNumber).toBe(certificationGeneralInfo.sessionNumber);
              snapshotHandler.push('adminCertificationInfo_status', certificationGeneralInfo.status ?? null);
              snapshotHandler.push('adminCertificationInfo_results', certificationGeneralInfo.result ?? null);

              if (testData.certification === CERTIFICATIONS_DATA.CLEA) {
                const cleaResult = await certificationInformationPage.getCleaResult();
                snapshotHandler.push('adminCertificationInfo_cleaResult', cleaResult ?? null);
              }

              const certificationDetails = await certificationInformationPage.getDetails();
              expect(certificationDetails.nbAnsweredQuestionsOverTotal).toBe('32/32');
              expect(certificationDetails.nbQuestionsOK).toBe(0);
              expect(certificationDetails.nbQuestionsKO).toBe(32);
              expect(certificationDetails.nbQuestionsAband).toBe(0);
              expect(certificationDetails.nbValidatedTechnicalIssues).toBe(0);
              snapshotHandler.push('adminCertificationDetails_status', certificationDetails.status ?? null);
              snapshotHandler.push('adminCertificationDetails_status', certificationDetails.result ?? null);
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
          const {
            mainStatus,
            extraStatus,
            detailsFramework,
            certificationCenter,
            examDate,
            result,
            comment,
            hasBadge,
          } = await certificateListPage.getCertificateData(certificationNumber);
          expect(mainStatus).toBe(testData.appCertificationListInfo.mainStatus);
          expect(extraStatus).toBe(testData.appCertificationListInfo.extraStatus);
          expect(detailsFramework).toBe(null);
          expect(certificationCenter).toBe('Centre de certification : ' + certificationCenterName);
          expect(examDate).toBe('Date de passage : ' + getNowAsDDMMYYYY());
          expect(comment).toBe(testData.appCertificationListInfo.comment);
          snapshotHandler.push('appCertificationListInfo_result', result);
          snapshotHandler.push('appCertificationListInfo_hasBadge', `${hasBadge}`);
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
  }
});
