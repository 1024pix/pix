import { knex } from '../../helpers/db.js';
import { test } from '../../helpers/fixtures.ts';
import { ChallengePage, IntermediateCheckpointPage, LoginPage } from '../../pages/pix-app/index.ts';
import data from './data.json' with { type: 'json' };

let COMPETENCE_TITLES: string[];
test.beforeEach(async () => {
  const competenceDTOs = await knex('learningcontent.competences')
    .jsonExtract('name_i18n', '$.fr', 'competenceTitle')
    .where('origin', 'Pix')
    .orderBy('index');
  COMPETENCE_TITLES = competenceDTOs.map(({ competenceTitle }: { competenceTitle: string }) => competenceTitle);
});

test('make user certifiable', async ({ page: pixAppPage }) => {
  test.slow();

  await pixAppPage.goto(process.env.PIX_APP_URL as string);

  const loginPage = new LoginPage(pixAppPage);
  await loginPage.signup(
    data.certifiableUser.firstName,
    data.certifiableUser.lastName,
    data.certifiableUser.email,
    data.certifiableUser.rawPassword,
  );

  await test.step('make user certifiable', async () => {
    for (const competenceTitle of [
      COMPETENCE_TITLES[14],
      COMPETENCE_TITLES[3],
      COMPETENCE_TITLES[9],
      COMPETENCE_TITLES[1],
      COMPETENCE_TITLES[10],
    ]) {
      await pixAppPage.getByRole('link', { name: 'Compétences', exact: true }).click();
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
});
