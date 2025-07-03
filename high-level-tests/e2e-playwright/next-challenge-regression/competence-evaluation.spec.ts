import { expect } from '@playwright/test';
import * as fs from 'fs';

import { useLoggedUser } from '../helpers/auth';
import { COMPETENCE_TITLES } from '../helpers/constants';
import { commonSeeds } from '../helpers/db.js';
import { test } from '../helpers/fixtures';
import { rightWrongAnswerCycle } from '../helpers/utils';
import { ChallengePage, CompetenceResultPage, FinalCheckpointPage, IntermediateCheckpointPage } from '../pages/pix-app';
useLoggedUser('pix-app');
test.beforeEach(async () => {
  await commonSeeds();
});

test('user assessing on 5 Pix Competences', async ({ page, testMode }) => {
  test.setTimeout(300_000);
  let results;
  const resultFilePath = './next-challenge-regression/competence-evaluation.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
      levels: [],
      pixScores: [],
    };
  } else {
    results = fs.readFileSync(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }

  const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 1, numWrong: 2 });
  await page.goto(process.env.PIX_APP_URL);
  await page.getByRole('link', { name: 'Toutes les compétences' }).click();
  let challengeIndex = 0;
  let competenceIndex = 0;
  for (const competenceTitle of [
    COMPETENCE_TITLES[3],
    COMPETENCE_TITLES[12],
    COMPETENCE_TITLES[7],
    COMPETENCE_TITLES[5],
    COMPETENCE_TITLES[6],
  ]) {
    await test.step(`"${competenceTitle}" assessment started`, async () => {
      await page.getByRole('link', { name: competenceTitle }).first().click();
      await page.getByRole('link', { name: 'Commencer' }).click();

      await test.step(`"${competenceTitle}" answering right or wrong according to pattern`, async () => {
        while (!page.url().endsWith('/checkpoint?finalCheckpoint=true')) {
          const challengePage = new ChallengePage(page);
          const challengeImprint = await challengePage.getChallengeImprint();
          if (testMode === 'record') {
            results.challengeImprints.push(challengeImprint);
          } else {
            expect(challengeImprint).toBe(results.challengeImprints[challengeIndex]);
          }
          ++challengeIndex;
          await challengePage.setRightOrWrongAnswer(rightWrongAnswerCycleIter.next().value as boolean);
          await challengePage.validateAnswer();

          if (page.url().includes('/checkpoint') && !page.url().includes('finalCheckpoint=true')) {
            const checkpointPage = new IntermediateCheckpointPage(page);
            await checkpointPage.goNext();
          }
        }
      });

      await test.step(`"${competenceTitle}" assessment results`, async () => {
        const finalCheckpointPage = new FinalCheckpointPage(page);
        await finalCheckpointPage.goToResults();
        const competenceResultPage = new CompetenceResultPage(page);
        const level = await competenceResultPage.getLevel();
        const pixScore = await competenceResultPage.getPixScore();
        if (testMode === 'record') {
          results.levels.push(level);
          results.pixScores.push(pixScore);
        } else {
          expect(level).toBe(results.levels[competenceIndex]);
          expect(pixScore).toBe(results.pixScores[competenceIndex]);
        }
        await competenceResultPage.goBackToCompetences();
      });
    });
    ++competenceIndex;
  }
  if (testMode === 'record') {
    fs.writeFileSync(resultFilePath, JSON.stringify(results));
  }
});
