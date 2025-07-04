import * as fs from 'fs/promises';

import { COMPETENCE_TITLES } from '../../helpers/constants';
import { buildAuthenticatedUsers } from '../../helpers/db.js';
import { expect, test } from '../../helpers/fixtures';
import { rightWrongAnswerCycle } from '../../helpers/utils';
import {
  ChallengePage,
  CompetenceResultPage,
  FinalCheckpointPage,
  IntermediateCheckpointPage,
} from '../../pages/pix-app';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
});

test('user assessing on 5 Pix Competences', async ({ pixAppUserContext, testMode }) => {
  test.setTimeout(140_000);
  const page = await pixAppUserContext.newPage();
  let results;
  const resultFilePath = './tests/evaluations/data/competence-evaluation.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
      levels: [],
      pixScores: [],
    };
  } else {
    results = await fs.readFile(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }

  const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 1, numWrong: 2 });
  await page.goto(process.env.PIX_APP_URL);
  await page.getByRole('link', { name: 'Toutes les compétences' }).click();
  let globalChallengeIndex = 0;
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

      let challengeIndexInCompetence = 0;
      await test.step(`"${competenceTitle}" answering right or wrong according to pattern`, async () => {
        while (!page.url().endsWith('/checkpoint?finalCheckpoint=true')) {
          const challengePage = new ChallengePage(page);
          const challengeImprint = await challengePage.getChallengeImprint();
          if (testMode === 'record') {
            results.challengeImprints.push(challengeImprint);
          } else {
            expect(challengeImprint).toBe(results.challengeImprints[globalChallengeIndex]);
            await expect(page.getByLabel('Votre progression')).toContainText(
              `Question ${(challengeIndexInCompetence % 5) + 1} / 5`,
            );
          }
          ++globalChallengeIndex;
          ++challengeIndexInCompetence;
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
    await fs.writeFile(resultFilePath, JSON.stringify(results));
  }
});
