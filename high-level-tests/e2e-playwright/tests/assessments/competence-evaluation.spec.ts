import { test } from '../../fixtures/index.ts';
import { knex, setAssessmentIdSequence } from '../../helpers/db.js';
import { rightWrongAnswerCycle } from '../../helpers/utils.ts';
import {
  ChallengePage,
  CompetenceResultPage,
  FinalCheckpointPage,
  IntermediateCheckpointPage,
  LoginPage,
} from '../../pages/pix-app/index.ts';

let COMPETENCE_TITLES: string[];
test.beforeEach(async () => {
  const competenceDTOs = await knex('learningcontent.competences')
    .jsonExtract('name_i18n', '$.fr', 'competenceTitle')
    .where('origin', 'Pix')
    .orderBy('index');
  COMPETENCE_TITLES = competenceDTOs.map(({ competenceTitle }: { competenceTitle: string }) => competenceTitle);
  // Reset assessment id sequence for smart random to be predictable
  await setAssessmentIdSequence(3000);
});

test(
  'user assessing on 5 Pix Competences',
  {
    tag: ['@snapshot', '@runSerially'],
    annotation: [
      {
        type: 'tag',
        description: `@snapshot - this test runs against a reference snapshot. Snapshot can be generated with UPDATE_SNAPSHOTS=true
         Reasons why a snapshot can be re-generated :
         - AssessmentIdSequence has changed
         - Reference Release has changed
         - Next challenge algorithm for competence evaluation has changed`,
      },
      {
        type: 'tag',
        description:
          '@runSerially - must run serially because this test fixes the assessment ID sequence to make sure to play on specific assessment ID',
      },
    ],
  },
  async ({ page, snapshotHandler, globalTestId }) => {
    test.slow();

    const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 1, numWrong: 2 });
    await page.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${globalTestId}@example.net`, 'Coucoulesdevs66');
    await page.getByRole('link', { name: 'Compétences', exact: true }).click();
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
          while (!page.url().includes('finalCheckpoint=true')) {
            const challengePage = new ChallengePage(page);
            const challengeImprint = await challengePage.getChallengeImprint();
            snapshotHandler.push('challenge imprint to have value', challengeImprint);
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
          snapshotHandler.push(`level for "${competenceTitle}" to have value`, level as string);
          snapshotHandler.push(`pixScore for "${competenceTitle}" to have value`, pixScore as string);
          await competenceResultPage.goBackToCompetences();
        });
      });
    }
    await snapshotHandler.expectOrRecord('competence-evaluation.json');
  },
);
