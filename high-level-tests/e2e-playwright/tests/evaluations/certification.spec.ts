import path from 'node:path';

import { BrowserContext } from '@playwright/test';
import * as fs from 'fs/promises';

import { buildAuthenticatedUsers, databaseBuilder } from '../../helpers/db.js';
import { expect, test } from '../../helpers/fixtures.ts';
import { rightWrongAnswerCycle } from '../../helpers/utils.ts';
import { CertificationStartPage, ChallengePage, IntermediateCheckpointPage } from '../../pages/pix-app/index.ts';
import { SessionCreationPage, SessionManagementPage } from '../../pages/pix-certif/index.ts';

const RESULT_DIR = path.resolve(import.meta.dirname, './data');
let COMPETENCE_TITLES: string[];
test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
  const competenceDTOs = await databaseBuilder
    .knex('learningcontent.competences')
    .jsonExtract('name_i18n', '$.fr', 'competenceTitle')
    .where('origin', 'Pix')
    .orderBy('index');
  COMPETENCE_TITLES = competenceDTOs.map(({ competenceTitle }: { competenceTitle: string }) => competenceTitle);
  databaseBuilder.factory.buildCertificationCpfCountry({
    commonName: 'FRANCE',
    originalName: 'FRANCE',
    code: '99100',
    matcher: 'ACEFNR',
  });
  databaseBuilder.factory.buildCertificationCpfCity({
    name: 'PERPIGNAN',
    postalCode: '66000',
    INSEECode: '66136',
    isActualName: true,
  });
  databaseBuilder.factory.buildComplementaryCertification.clea({});
  databaseBuilder.factory.buildFlashAlgorithmConfiguration({
    maximumAssessmentLength: 32,
    challengesBetweenSameCompetence: null,
    limitToOneQuestionPerTube: true,
    enablePassageByAllCompetences: true,
    variationPercent: 0.5,
    createdAt: new Date('1977-10-19'),
  });
  await databaseBuilder.commit();
});

test('user takes a certification test', async ({
  pixAppUserContext,
  pixCertifProContext,
  testMode,
}: {
  pixAppUserContext: BrowserContext;
  pixCertifProContext: BrowserContext;
  testMode: string;
}) => {
  test.setTimeout(60_000);
  let results;
  const resultFilePath = path.join(RESULT_DIR, 'certification.json');
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
    };
  } else {
    results = await fs.readFile(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }

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
      birthdate: '19/01/1981',
      birthCountry: 'FRANCE',
      birthCity: 'Perpignan',
      postalCode: '66000',
    });
  });

  const pixAppPage = await pixAppUserContext.newPage();
  await test.step('make candidate certifiable', async () => {
    await pixAppPage.goto(process.env.PIX_APP_URL as string);
    for (const competenceTitle of [
      COMPETENCE_TITLES[14],
      COMPETENCE_TITLES[3],
      COMPETENCE_TITLES[9],
      COMPETENCE_TITLES[1],
      COMPETENCE_TITLES[10],
    ]) {
      await pixAppPage.getByRole('link', { name: 'Toutes les compétences' }).click();
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
        if (testMode === 'record') {
          results.challengeImprints.push(challengeImprint);
        } else {
          expect(challengeImprint).toBe(results.challengeImprints[challengeIndex]);
          await expect(pixAppPage.getByLabel('Votre progression')).toContainText(`${challengeIndex + 1} / 32`);
        }
        ++challengeIndex;
        await challengePage.setRightOrWrongAnswer(rightWrongAnswerCycleIter.next().value as boolean);
        await challengePage.validateAnswer();
      }
    });
    if (testMode === 'check') {
      await test.step(`reaches end of certification test`, async () => {
        await expect(pixAppPage.locator('h1')).toContainText('Test terminé !');
        await expect(pixAppPage.locator('h2')).toContainText(
          'Vos résultats, en attente de validation par les équipes Pix, seront bientôt disponibles sur votre compte Pix',
        );
      });
    }
  });
  if (testMode === 'record') {
    await fs.writeFile(resultFilePath, JSON.stringify(results));
  }
});
