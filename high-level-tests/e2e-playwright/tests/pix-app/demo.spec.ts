import { expect } from '@playwright/test';
import * as fs from 'fs';

import { DEMO_COURSE_ID, NB_CHALLENGES_IN_DEMO_COURSE } from '../../helpers/constants';
import { commonSeeds } from '../../helpers/db';
import { test } from '../../helpers/fixtures';
import { rightWrongAnswerCycle } from '../../helpers/utils';
import { ChallengePage } from '../../pages/pix-app';

test.beforeEach(async () => {
  await commonSeeds();
});

test('user assesses on course demo', async ({ page, testMode }) => {
  test.setTimeout(100_000);
  let results;
  const resultFilePath = './tests/data/demo.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
    };
  } else {
    results = fs.readFileSync(resultFilePath, 'utf-8');
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
    fs.writeFileSync(resultFilePath, JSON.stringify(results));
  } else {
    await expect(page.locator('body')).toContainText(/Vos réponses/);
  }
});
