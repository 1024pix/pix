import { databaseBuilder } from '../../helpers/db';
import { expect, test } from '../../helpers/fixtures';
import { ChallengePage } from '../../pages/pix-app';

let PREVIEW_CHALLENGE_ID: string;
test.beforeEach(async () => {
  const { id } = await databaseBuilder
    .knex('learningcontent.challenges')
    .select('id')
    .whereLike('instruction', '%<br>ninaimprint 1</br>%')
    .first();
  PREVIEW_CHALLENGE_ID = id;
});

test('user assesses on preview challenge', async ({ page }) => {
  test.setTimeout(10_000);
  await test.step(`PREVIEW assessment started`, async () => {
    await page.goto(process.env.PIX_APP_URL + '/challenges/' + PREVIEW_CHALLENGE_ID + '/preview');
    const challengePage = new ChallengePage(page);
    const challengeImprint = await challengePage.getChallengeImprint();
    expect(challengeImprint).toBe('1');
    await expect(page.getByLabel('Votre progression')).toContainText('1 / 1');
    await challengePage.setRightOrWrongAnswer(true);
    await challengePage.validateAnswer();
  });
});
