import * as fs from 'fs/promises';

import { databaseBuilder } from '../../helpers/db';
import { expect, test } from '../../helpers/fixtures';
import { rightWrongAnswerCycle } from '../../helpers/utils';
import { ChallengePage } from '../../pages/pix-app';

let NB_CHALLENGES_IN_DEMO_COURSE: number;
let DEMO_COURSE_ID = null;

test.beforeEach(async () => {
  const courseDTOs = await databaseBuilder
    .knex('learningcontent.courses')
    .select('*')
    .where({ isActive: true })
    .orderBy('id', 'asc');
  for (const courseDTO of courseDTOs) {
    const challengeDTOs = await databaseBuilder
      .knex('learningcontent.challenges')
      .select('*')
      .whereIn('id', courseDTO.challenges)
      .where((queryBuilder) => {
        queryBuilder.whereRaw('? = ANY(learningcontent.challenges.locales)', ['fr']);
        queryBuilder.orWhereRaw('? = ANY(learningcontent.challenges.locales)', ['fr-fr']);
      });
    if (challengeDTOs.length === courseDTO.challenges.length) {
      DEMO_COURSE_ID = courseDTO.id;
      NB_CHALLENGES_IN_DEMO_COURSE = courseDTO.challenges.length;
      break;
    }
  }
  if (!DEMO_COURSE_ID) {
    throw new Error('No suitable DEMO course found for this test');
  }
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
