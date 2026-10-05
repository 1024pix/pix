import { Page } from '@playwright/test';

import { PixCertifiableUserData } from '../../helpers/certification/types.ts';
import { knex } from '../../helpers/db.ts';
import { CERTIFICATIONS_DATA } from '../../helpers/db-data.ts';
import { HomePage } from '../../pages/pix-app/index.ts';
import { InvigilatorLoginPage, InvigilatorOverviewPage, SessionListPage } from '../../pages/pix-certif/index.ts';
import { baseCertifTest } from './base.ts';

type EnrollCandidateParams = {
  testRef: string;
  certificationKey?: string;
  certifiableUserData: PixCertifiableUserData;
};

type EnrollCandidateResult = {
  sessionNumber: string;
  accessCode: string;
  invigilatorCode: string;
  certificationCenterName: string;
};

type PassCertificationExamParams = {
  certifiableUserData: PixCertifiableUserData;
  sessionNumber: string;
  accessCode: string;
  invigilatorCode: string;
  rightWrongAnswersSequence: boolean[];
  certificationKey?: string;
  pixAppPage: Page;
};

type PassManyCertificationExamsParams = {
  examsData: {
    certifiableUserData: PixCertifiableUserData;
    rightWrongAnswersSequence: boolean[];
    certificationKey?: string;
    pixAppPage: Page;
  }[];
  sessionNumber: string;
  accessCode: string;
  invigilatorCode: string;
};

type PassCertificationExamResult = {
  invigilatorOverviewPage: InvigilatorOverviewPage;
  certificationNumber: string;
};

type PassManyCertificationExamsResults = {
  invigilatorOverviewPage: InvigilatorOverviewPage;
  certificationNumbers: string[];
};

type EnrollCandidateAndPassExamParams = {
  testRef: string;
  certificationKey?: string;
  certifiableUserData: PixCertifiableUserData;
  rightWrongAnswersSequence: boolean[];
  pixAppPage: Page;
};

type EnrollCandidateAndPassExamResult = {
  sessionNumber: string;
  certificationNumber: string;
  certificationCenterName: string;
  invigilatorOverviewPage: InvigilatorOverviewPage;
};

export const certifSetupFixtures = baseCertifTest.extend<{
  enrollCandidate: (args: EnrollCandidateParams) => Promise<EnrollCandidateResult>;
  passCertificationExam: (args: PassCertificationExamParams) => Promise<PassCertificationExamResult>;
  passManyCertificationExams: (args: PassManyCertificationExamsParams) => Promise<PassManyCertificationExamsResults>;
  enrollCandidateAndPassExam: (args: EnrollCandidateAndPassExamParams) => Promise<EnrollCandidateAndPassExamResult>;
  waitForScoringJobToBeCompleted: (args: string) => Promise<void>;
}>({
  enrollCandidate: async ({ pixCertifProPage }, use) => {
    const enrollCandidate = async ({
      testRef,
      certificationKey = CERTIFICATIONS_DATA.CORE,
      certifiableUserData,
    }: EnrollCandidateParams) => {
      let sessionNumber = '',
        accessCode = '',
        invigilatorCode = '',
        certificationCenterName = '';

      await certifSetupFixtures.step('Enrollment', async () => {
        await pixCertifProPage.goto(process.env.PIX_CERTIF_URL!);

        const sessionManagementPage = await certifSetupFixtures.step('Create session', async () => {
          const sessionListPage = new SessionListPage(pixCertifProPage);
          certificationCenterName = await sessionListPage.getCertificationCenterName();
          const sessionCreationPage = await sessionListPage.goToCreateSession();
          const sessionManagementPage = await sessionCreationPage.createSession({
            address: `address ${testRef}`,
            room: `room ${testRef}`,
            examiner: `examiner ${testRef}`,
            hour: '09',
            minute: '05',
          });

          const sessionData = await sessionManagementPage.getSessionData();
          sessionNumber = sessionData.sessionNumber;
          accessCode = sessionData.accessCode;
          invigilatorCode = sessionData.invigilatorCode;
          return sessionManagementPage;
        });

        await certifSetupFixtures.step('enroll for specific certification', async () => {
          await sessionManagementPage.goToEnrollCandidateForm();
          await sessionManagementPage.addCandidate({
            ...certifiableUserData,
            enrollFor: certificationKey,
          });
        });
      });

      return {
        sessionNumber,
        accessCode,
        invigilatorCode,
        certificationCenterName,
      };
    };
    await use(enrollCandidate);
  },
  passCertificationExam: async ({ pixCertifInvigilatorPage, snapshotHandler }, use) => {
    const passCertificationExam = async ({
      certifiableUserData,
      sessionNumber,
      accessCode,
      invigilatorCode,
      certificationKey = 'CORE',
      rightWrongAnswersSequence,
      pixAppPage,
    }: PassCertificationExamParams) => {
      let certificationNumber: string = '';
      const invigilatorOverviewPage = await certifSetupFixtures.step('Evaluation', async () => {
        await pixAppPage.goto(process.env.PIX_APP_URL!);

        const certificationAccessCodePage = await certifSetupFixtures.step(
          'Candidate join the session, awaiting to be authorized to start',
          async () => {
            const homePage = new HomePage(pixAppPage);
            const certificationStartPage = await homePage.goToStartCertification();
            if (certificationKey === CERTIFICATIONS_DATA.CLEA) {
              await expect(pixAppPage.getByText('Prêt pour le CléA numérique')).toBeVisible();
            }
            return certificationStartPage.fillSessionInfoAndNavigateIntro({
              sessionNumber,
              ...certifiableUserData,
            });
          },
        );

        const invigilatorOverviewPage = await certifSetupFixtures.step(
          'Invigilator authorized candidate to start',
          async () => {
            const invigLogin = new InvigilatorLoginPage(pixCertifInvigilatorPage);
            const invigOverview = await invigLogin.login(sessionNumber, invigilatorCode);
            await invigOverview.authorizeCandidateToStart(certifiableUserData.firstName, certifiableUserData.lastName);
            return invigOverview;
          },
        );

        await certifSetupFixtures.step('Candidate takes the test', async () => {
          const challengePage = await certificationAccessCodePage.fillAccessCodeAndStartCertificationTest(accessCode);
          certificationNumber = await challengePage.getCertificationNumber();
          for (const [i, shouldAnswerCorrectly] of rightWrongAnswersSequence.entries()) {
            const challengeImprint = await challengePage.getChallengeImprint();
            snapshotHandler.push('challenge imprint to have value', challengeImprint);
            await expect(pixAppPage.getByTestId('pw-certification-progression')).toContainText(`${i + 1} / 32`);
            await challengePage.setRightOrWrongAnswer(shouldAnswerCorrectly);
            await challengePage.validateAnswer();
          }
        });
        return invigilatorOverviewPage;
      });

      return {
        invigilatorOverviewPage,
        certificationNumber,
      };
    };
    await use(passCertificationExam);
  },
  passManyCertificationExams: async ({ pixCertifInvigilatorPage }, use) => {
    const passManyCertificationExams = async ({
      examsData,
      sessionNumber,
      accessCode,
      invigilatorCode,
    }: PassManyCertificationExamsParams) => {
      const certificationNumbers: string[] = [];
      const invigilatorOverviewPage = await certifSetupFixtures.step('Evaluation', async () => {
        const reachAccessCodePagePromises = examsData.map(async (examData) => {
          await examData.pixAppPage.goto(process.env.PIX_APP_URL!);
          return await certifSetupFixtures.step(
            `Candidate ${examData.certifiableUserData.firstName} join the session, awaiting to be authorized to start`,
            async () => {
              const homePage = new HomePage(examData.pixAppPage);
              const certificationStartPage = await homePage.goToStartCertification();
              if (examData.certificationKey === CERTIFICATIONS_DATA.CLEA) {
                await expect(examData.pixAppPage.getByText('Prêt pour le CléA numérique')).toBeVisible();
              }
              const accessCodePage = await certificationStartPage.fillSessionInfoAndNavigateIntro({
                sessionNumber,
                ...examData.certifiableUserData,
              });
              return {
                examData,
                accessCodePage,
              };
            },
          );
        });
        const examDatasWithAccessCodePage = [];
        for (const promise of reachAccessCodePagePromises) {
          const accessCodePage = await promise;
          examDatasWithAccessCodePage.push(accessCodePage);
        }

        const invigilatorOverviewPage = await certifSetupFixtures.step(
          'Invigilator authorizes all candidates to start',
          async () => {
            const invigLogin = new InvigilatorLoginPage(pixCertifInvigilatorPage);
            const invigOverview = await invigLogin.login(sessionNumber, invigilatorCode);
            for (const examData of examsData) {
              await invigOverview.authorizeCandidateToStart(
                examData.certifiableUserData.firstName,
                examData.certifiableUserData.lastName,
              );
            }
            return invigOverview;
          },
        );

        const passExamPromises = examDatasWithAccessCodePage.map(async ({ accessCodePage, examData }) => {
          await certifSetupFixtures.step(
            `Candidate ${examData.certifiableUserData.firstName} takes the test`,
            async () => {
              const challengePage = await accessCodePage.fillAccessCodeAndStartCertificationTest(accessCode);
              const certificationNumber = await challengePage.getCertificationNumber();
              certificationNumbers.push(certificationNumber);
              for (const [i, shouldAnswerCorrectly] of examData.rightWrongAnswersSequence.entries()) {
                await expect(examData.pixAppPage.getByTestId('pw-certification-progression')).toContainText(
                  `${i + 1} / 32`,
                );
                await challengePage.setRightOrWrongAnswer(shouldAnswerCorrectly);
                await challengePage.validateAnswer();
              }
            },
          );
        });
        for (const promise of passExamPromises) {
          await promise;
        }

        return invigilatorOverviewPage;
      });

      return {
        invigilatorOverviewPage,
        certificationNumbers,
      };
    };
    await use(passManyCertificationExams);
  },
  enrollCandidateAndPassExam: async ({ enrollCandidate, passCertificationExam }, use) => {
    const enrollCandidateAndPassExam = async ({
      testRef,
      certificationKey = 'CORE',
      certifiableUserData,
      rightWrongAnswersSequence,
      pixAppPage,
    }: EnrollCandidateAndPassExamParams) => {
      const { sessionNumber, accessCode, invigilatorCode, certificationCenterName } = await enrollCandidate({
        testRef,
        certificationKey,
        certifiableUserData,
      });
      const { invigilatorOverviewPage, certificationNumber } = await passCertificationExam({
        certifiableUserData,
        sessionNumber,
        accessCode,
        invigilatorCode,
        rightWrongAnswersSequence,
        certificationKey,
        pixAppPage,
      });

      return { sessionNumber, invigilatorOverviewPage, certificationNumber, certificationCenterName };
    };
    await use(enrollCandidateAndPassExam);
  },
  // eslint-disable-next-line no-empty-pattern
  waitForScoringJobToBeCompleted: async ({}, use) => {
    const waitForScoringJobToBeCompleted = async (certificationNumber: string) => {
      const start = Date.now();

      while (Date.now() - start < 10_000) {
        const job = await knex('pgboss.job')
          .where({
            name: 'CertificationCompletedJob',
          })
          .whereRaw(`data @> ?::jsonb`, [JSON.stringify({ certificationCourseId: parseInt(certificationNumber) })])
          .orderBy('created_on', 'desc')
          .first();

        if (job?.state === 'completed') {
          return;
        }

        await new Promise((r) => setTimeout(r, 1_000));
      }

      throw new Error('Certification job did not reach completed state in time or never existed');
    };
    await use(waitForScoringJobToBeCompleted);
  },
});

export const expect = certifSetupFixtures.expect;
