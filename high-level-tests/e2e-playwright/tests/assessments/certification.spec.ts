import { knex } from '../../helpers/db.js';
import { expect, test } from '../../helpers/fixtures.ts';
import { rightWrongAnswerCycle } from '../../helpers/utils.ts';
import {
  CertificationStartPage,
  ChallengePage,
  IntermediateCheckpointPage,
  LoginPage,
} from '../../pages/pix-app/index.ts';
import { SessionCreationPage, SessionManagementPage } from '../../pages/pix-certif/index.ts';

let COMPETENCE_TITLES: string[];
test.beforeEach(async () => {
  const competenceDTOs = await knex('learningcontent.competences')
    .jsonExtract('name_i18n', '$.fr', 'competenceTitle')
    .where('origin', 'Pix')
    .orderBy('index');
  COMPETENCE_TITLES = competenceDTOs.map(({ competenceTitle }: { competenceTitle: string }) => competenceTitle);
});

test(
  'user takes a certification test',
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
  async ({ page: pixAppPage, pixCertifProContext, snapshotHandler, globalTestId }) => {
    test.slow();
    const pixCertifPage = await pixCertifProContext.newPage();
    await test.step('creates a certification session', async () => {
      await pixCertifPage.goto(process.env.PIX_CERTIF_URL as string);
      await pixCertifPage.getByRole('link', { name: 'Créer une session' }).click();
      const sessionCreationPage = new SessionCreationPage(pixCertifPage);
      await sessionCreationPage.createSession({
        address: 'PixSite',
        room: 'PixSalle',
        examiner: 'Oeil du tigre',
        hour: '09',
        minute: '05',
      });
    });

    const sessionManagementPage = new SessionManagementPage(pixCertifPage);
    const { sessionNumber, accessCode, invigilatorCode } = await sessionManagementPage.getSessionData();
    await test.step('adds a candidate', async () => {
      await sessionManagementPage.addCandidate({
        sex: 'F',
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthCountry: 'FRANCE',
        birthCity: 'Perpignan',
        postalCode: '66000',
      });
    });

    await pixAppPage.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(pixAppPage);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${globalTestId}@example.net`, 'Coucoulesdevs66');
    await test.step('make candidate certifiable', async () => {
      for (const competenceTitle of [
        COMPETENCE_TITLES[14],
        COMPETENCE_TITLES[3],
        COMPETENCE_TITLES[9],
        COMPETENCE_TITLES[1],
        COMPETENCE_TITLES[10],
      ]) {
        await pixAppPage.getByRole('link', { name: 'Compétences', exact: true }).click();
        await test.step(`"${competenceTitle}" reaching level 1`, async () => {
          await pixAppPage.getByRole('link', { name: competenceTitle }).first().click();
          await pixAppPage.getByRole('link', { name: 'Commencer' }).click();
          let levelupDone = false;
          while (!levelupDone) {
            const challengePage = new ChallengePage(pixAppPage);
            await challengePage.setRightOrWrongAnswer(true);
            await challengePage.validateAnswer();
            levelupDone = await challengePage.hasUserLeveledUp();
            if (pixAppPage.url().includes('/checkpoint') && !pixAppPage.url().includes('finalCheckpoint=true')) {
              const checkpointPage = new IntermediateCheckpointPage(pixAppPage);
              await checkpointPage.goNext();
            }
          }
          const challengePage = new ChallengePage(pixAppPage);
          await challengePage.leave();
        });
      }
    });

    await test.step('user enter session up until access code page', async () => {
      await pixAppPage.getByRole('link', { name: 'Certification' }).click();
      const certificationStartPage = new CertificationStartPage(pixAppPage);
      await certificationStartPage.fillSessionInfoAndNavigateIntro({
        sessionNumber,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthDay: '19',
        birthMonth: '01',
        birthYear: '1981',
      });
    });

    await test.step('invigilatorCode authorizes user to access the certification session', async () => {
      await pixCertifPage.goto(process.env.PIX_CERTIF_URL + '/connexion-espace-surveillant');
      await pixCertifPage.getByLabel('Numéro de la session').fill(sessionNumber);
      await pixCertifPage.getByLabel('Mot de passe de la session').fill(invigilatorCode);
      await pixCertifPage.getByRole('button', { name: 'Surveiller la session' }).click();
      await pixCertifPage.getByRole('button', { name: "Confirmer la présence de l'élève Buffy Summers" }).click();
    });

    await test.step('user starts the test', async () => {
      await pixAppPage.getByLabel("Code d'accès communiqué").fill(accessCode);
      await pixAppPage.getByRole('button', { name: 'Commencer mon test' }).click();
      const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 2, numWrong: 1 });
      let challengeIndex = 0;
      await test.step(`answering right or wrong according to pattern`, async () => {
        while (!pixAppPage.url().endsWith('/results')) {
          const challengePage = new ChallengePage(pixAppPage);
          const challengeImprint = await challengePage.getChallengeImprint();
          snapshotHandler.push('challenge imprint to have value', challengeImprint);
          await expect(pixAppPage.getByLabel('Votre progression')).toContainText(`${challengeIndex + 1} / 32`);
          ++challengeIndex;
          await challengePage.setRightOrWrongAnswer(rightWrongAnswerCycleIter.next().value as boolean);
          await challengePage.validateAnswer();
        }
      });

      await test.step(`reaches end of certification test`, async () => {
        await expect(pixAppPage.locator('h1')).toContainText('Test terminé !');
        await expect(pixAppPage.locator('h2')).toContainText(
          'Vos résultats, en attente de validation par les équipes Pix, seront bientôt disponibles sur votre compte Pix',
        );
      });

      await snapshotHandler.expectOrRecord('certification.json');
    });
  },
);
