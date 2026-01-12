import {
  authorizeCandidateToStartAndExpectSuccess,
  createSessionAndExpectSuccess,
  enrollCandidateAndExpectSuccess,
  enterSessionUntilAccessCodeAndExpectSuccess,
} from '../../../../helpers/certification/session.ts';
import { expect, test } from '../../../../helpers/fixtures.ts';
import { ChallengePage, LoginPage } from '../../../../pages/pix-app/index.ts';
import { SessionManagementPage } from '../../../../pages/pix-certif/index.ts';
import data from '../../data.json' with { type: 'json' };

const testRef = 'PRO_CORE_100success';

test(
  `user takes a certification test for a PRO certification center, only CORE subscription. 100% success. REF : ${testRef}`,
  {
    tag: ['@snapshot'],
    annotation: [
      {
        type: 'tag',
        description: `@snapshot - this test runs against a reference snapshot. Snapshot can be generated with UPDATE_SNAPSHOTS=true
         Reasons why a snapshot can be re-generated :
         - Reference Release has changed
         - Next challenge algorithm for certification V3 has changed`,
      },
    ],
  },
  async ({ page: pixAppPage, pixCertifProContext, snapshotHandler }) => {
    test.slow();

    const pixCertifPage = await pixCertifProContext.newPage();

    let sessionNumber = '',
      accessCode = '',
      invigilatorCode = '';

    await test.step('Enrollment', async () => {
      await test.step('creates a certification session', async () => {
        await pixCertifPage.goto(process.env.PIX_CERTIF_URL as string);
        await pixCertifPage.getByRole('link', { name: 'Créer une session' }).click();
        await createSessionAndExpectSuccess(pixCertifPage, {
          address: `address ${testRef}`,
          room: `room ${testRef}`,
          examiner: `examiner ${testRef}`,
          hour: '09',
          minute: '05',
        });
      });

      const sessionManagementPage = new SessionManagementPage(pixCertifPage);
      await pixCertifPage.getByRole('link', { name: 'Détails' }).click();

      const sessionData = await sessionManagementPage.getSessionData();
      sessionNumber = sessionData.sessionNumber;
      accessCode = sessionData.accessCode;
      invigilatorCode = sessionData.invigilatorCode;

      await test.step('adds a candidate for core certification', async () => {
        await pixCertifPage.getByRole('link', { name: 'Candidats' }).click();
        await pixCertifPage.getByRole('button', { name: 'Inscrire un candidat' }).click();
        await enrollCandidateAndExpectSuccess(pixCertifPage, data.certifiableUser);
      });
    });

    await test.step('Evaluation', async () => {
      await pixAppPage.goto(process.env.PIX_APP_URL as string);
      const loginPage = new LoginPage(pixAppPage);
      await loginPage.login(data.certifiableUser.email, data.certifiableUser.rawPassword);

      await test.step('user enter session up until access code page', async () => {
        await pixAppPage.getByRole('link', { name: 'Certification' }).click();
        await enterSessionUntilAccessCodeAndExpectSuccess(pixAppPage, {
          sessionNumber,
          ...data.certifiableUser,
        });
      });

      await test.step('invigilator authorizes user to access the certification session', async () => {
        await pixCertifPage.goto(process.env.PIX_CERTIF_URL + '/connexion-espace-surveillant');
        await authorizeCandidateToStartAndExpectSuccess(pixCertifPage, {
          sessionNumber,
          invigilatorCode,
          firstName: data.certifiableUser.firstName,
          lastName: data.certifiableUser.lastName,
        });
      });

      await test.step('user run the test and answers everything correctly', async () => {
        await pixAppPage.getByLabel("Code d'accès communiqué").fill(accessCode);
        await pixAppPage.getByRole('button', { name: 'Commencer mon test' }).click();

        await test.step(`answering always right`, async () => {
          let challengeIndex = 0;

          while (!pixAppPage.url().endsWith('/results')) {
            const challengePage = new ChallengePage(pixAppPage);
            const challengeImprint = await challengePage.getChallengeImprint();
            snapshotHandler.push('challenge imprint to have value', challengeImprint);
            await expect(pixAppPage.getByLabel('Votre progression')).toContainText(`${challengeIndex + 1} / 32`);
            ++challengeIndex;
            await challengePage.setRightOrWrongAnswer(true);
            await challengePage.validateAnswer();
          }
        });

        await test.step(`reaches end of certification test`, async () => {
          await expect(pixAppPage.locator('h1')).toContainText('Test terminé !');
          await expect(pixAppPage.locator('h2')).toContainText(
            'Vos résultats, en attente de validation par les équipes Pix, seront bientôt disponibles sur votre compte Pix',
          );
        });
        await snapshotHandler.expectOrRecord(`recette-certif_${testRef}.json`);
      });
    });

    await test.step('Finalization and scoring', async () => {
      await pixCertifPage.goto(process.env.PIX_CERTIF_URL as string);
      await pixCertifPage.getByRole('row', { name: new RegExp(testRef) }).click();
      await pixCertifPage.getByRole('link', { name: 'Finaliser la session' }).click();

      await expect(pixCertifPage.getByText(data.certifiableUser.firstName)).toBeVisible();
      await pixCertifPage.getByRole('button', { name: 'Finaliser' }).click();
      await pixCertifPage.getByRole('button', { name: 'Confirmer la finalisation' }).click();
      await expect(
        pixCertifPage.getByText('Les informations de la session ont été transmises avec succès.'),
      ).toBeVisible();
    });
  },
);
