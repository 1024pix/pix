import { expect, test } from '../../fixtures/index.ts';
import { knex } from '../../helpers/db.ts';
import { ChallengePage } from '../../pages/pix-app/index.ts';

let PREVIEW_CHALLENGE_ID: string;
test.beforeEach(async () => {
  const { id } = await knex('learningcontent.challenges').select('id').where('status', 'validé').first();
  PREVIEW_CHALLENGE_ID = id;
});

test(
  'user assesses on preview challenge',
  {
    tag: ['@snapshot'],
    annotation: [
      {
        type: 'tag',
        description: `@snapshot - this test runs against a reference snapshot. Snapshot can be generated with UPDATE_SNAPSHOTS=true
         Reasons why a snapshot can be re-generated :
         - Reference Release has changed`,
      },
    ],
  },
  async ({ page, snapshotHandler }) => {
    await test.step(`PREVIEW assessment started`, async () => {
      await page.goto(process.env.PIX_APP_URL + '/challenges/' + PREVIEW_CHALLENGE_ID + '/preview');
      const challengePage = new ChallengePage(page);
      const challengeImprint = await challengePage.getChallengeImprint();
      snapshotHandler.push('challenge imprint to have value', challengeImprint);

      await expect(page.getByLabel('1 sur 1')).toBeVisible();
      await challengePage.setRightOrWrongAnswer(true);
      await challengePage.validateAnswer();
    });
    await snapshotHandler.expectOrRecord('preview.json');
  },
);
