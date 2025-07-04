import * as fs from 'fs/promises';

import { databaseBuilder } from '../../helpers/db';
import { RANDOM_SEED } from '../../helpers/db-data';
import { expect, test } from '../../helpers/fixtures';
import { rightWrongAnswerCycle } from '../../helpers/utils';
import { ChallengePage } from '../../pages/pix-app';

const NB_CHALLENGES_IN_DEMO_COURSE = 30;
const DEMO_COURSE_ID = 'coursePLAYWRIGHT';

test.beforeEach(async () => {
  await databaseBuilder.knex.raw('SELECT setseed(?)', [RANDOM_SEED]);
  const challengeIds = await databaseBuilder
    .knex('learningcontent.challenges')
    .pluck('id')
    .where('status', '=', 'validé')
    .whereRaw('? = ANY(locales)', ['fr'])
    .orderByRaw('random()')
    .limit(NB_CHALLENGES_IN_DEMO_COURSE);
  databaseBuilder.factory.learningContent.buildCourse({
    id: DEMO_COURSE_ID,
    name: 'Test démo Playwright',
    description: 'un test de démo pour Playwright',
    isActive: true,
    competences: [],
    challenges: challengeIds,
  });
  await databaseBuilder.commit();
});

test('user assesses on course demo', async ({ page, testMode }) => {
  test.setTimeout(100_000);
  let results;
  const resultFilePath = './tests/evaluations/data/demo.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
    };
  } else {
    results = await fs.readFile(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }
  const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 1, numWrong: 1 });
  let challengeIndex = 0;
  await test.step(`DEMO assessment started`, async () => {
    await page.goto(process.env.PIX_APP_URL + '/courses/' + DEMO_COURSE_ID);
    await test.step(` answering right or wrong according to pattern`, async () => {
      while (!page.url().endsWith('results')) {
        const challengePage = new ChallengePage(page);
        const challengeImprint = await challengePage.getChallengeImprint();
        if (testMode === 'record') {
          results.challengeImprints.push(challengeImprint);
        } else {
          expect(challengeImprint).toBe(results.challengeImprints[challengeIndex]);
          await expect(page.getByLabel('Votre progression')).toContainText(
            `Question ${challengeIndex + 1} / ${NB_CHALLENGES_IN_DEMO_COURSE}`,
          );
        }
        ++challengeIndex;
        await challengePage.setRightOrWrongAnswer(rightWrongAnswerCycleIter.next().value as boolean);
        await challengePage.validateAnswer();
      }
    });
  });
  if (testMode === 'record') {
    await fs.writeFile(resultFilePath, JSON.stringify(results));
  } else {
    await expect(page.locator('body')).toContainText(/Vos réponses/);
  }
});
