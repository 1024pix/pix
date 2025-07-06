import * as fs from 'fs/promises';

import { databaseBuilder } from '../../helpers/db';
import { RANDOM_SEED } from '../../helpers/db-data';
import { expect, test } from '../../helpers/fixtures';
import { ChallengePage } from '../../pages/pix-app';

let PREVIEW_CHALLENGE_ID: string;
test.beforeEach(async () => {
  await databaseBuilder.knex.raw('SELECT setseed(?)', [RANDOM_SEED]);
  const { id } = await databaseBuilder
    .knex('learningcontent.challenges')
    .select('id')
    .where('status', '=', 'validé')
    .whereRaw('? = ANY(locales)', ['fr'])
    .orderByRaw('random()')
    .first();
  PREVIEW_CHALLENGE_ID = id;
});

test('user assesses on preview challenge', async ({ page, testMode }) => {
  test.setTimeout(10_000);
  let results;
  const resultFilePath = './tests/evaluations/data/preview.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
    };
  } else {
    results = await fs.readFile(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }
  await test.step(`PREVIEW assessment started`, async () => {
    await page.goto(process.env.PIX_APP_URL + '/challenges/' + PREVIEW_CHALLENGE_ID + '/preview');
    const challengePage = new ChallengePage(page);
    const challengeImprint = await challengePage.getChallengeImprint();
    if (testMode === 'record') {
      results.challengeImprints.push(challengeImprint);
    } else {
      expect(challengeImprint).toBe(results.challengeImprints[0]);
      await expect(page.getByLabel('Votre progression')).toContainText('1 / 1');
    }
    await challengePage.setRightOrWrongAnswer(true);
    await challengePage.validateAnswer();
  });

  if (testMode === 'record') {
    await fs.writeFile(resultFilePath, JSON.stringify(results));
  } else {
    await expect(page.locator('body')).toContainText(/Vos réponses/);
  }
});
