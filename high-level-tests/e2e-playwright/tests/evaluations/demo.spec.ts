import * as fs from 'fs/promises';

import { databaseBuilder } from '../../helpers/db';
import { expect, test } from '../../helpers/fixtures';
import { rightWrongAnswerCycle } from '../../helpers/utils';
import { ChallengePage } from '../../pages/pix-app';

let NB_CHALLENGES_IN_DEMO_COURSE: number;
let DEMO_COURSE_ID: string;
const DEMO_COURSE_NAME = 'Panel Pix+ - Stage';

test.beforeEach(async () => {
  const courseDTO = await databaseBuilder
    .knex('learningcontent.courses')
    .select('*')
    .where('name', DEMO_COURSE_NAME)
    .first();
  NB_CHALLENGES_IN_DEMO_COURSE = courseDTO.challenges.length;
  DEMO_COURSE_ID = courseDTO.id;
});

test('user assesses on course demo', async ({ page, testMode }) => {
  test.setTimeout(60_000);
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
