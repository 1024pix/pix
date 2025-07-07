import * as fs from 'fs/promises';

import { buildAuthenticatedUsers, databaseBuilder } from '../../helpers/db.js';
import { PIX_ORGA_PRO_DATA } from '../../helpers/db-data';
import { expect, test } from '../../helpers/fixtures';
import { rightWrongAnswerCycle } from '../../helpers/utils';
import {
  CampaignResultsPage,
  ChallengePage,
  FinalCheckpointPage,
  IntermediateCheckpointPage,
  StartCampaignPage,
} from '../../pages/pix-app';
import { CreateCampaignPage } from '../../pages/pix-orga';

let COMPETENCE_TITLES: string[];
test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
  const competenceDTOs = await databaseBuilder
    .knex('learningcontent.competences')
    .jsonExtract('name_i18n', '$.fr', 'competenceTitle')
    .where('origin', 'Pix')
    .orderBy('index');
  COMPETENCE_TITLES = competenceDTOs.map(({ competenceTitle }) => competenceTitle);
  const targetProfileId = databaseBuilder.factory.buildTargetProfile({
    name: 'PC PLAYWRIGHT',
    ownerOrganizationId: PIX_ORGA_PRO_DATA.organization.id,
    isSimplifiedAccess: false,
    description: 'PC pour Playwright',
    comment: null,
    imageUrl: null,
    outdated: false,
    areKnowledgeElementsResettable: false,
  }).id;
  const tubeDTOs: { competenceId: string; tubeId: string }[] = await databaseBuilder
    .knex('learningcontent.tubes')
    .distinct()
    .select({
      competenceId: 'learningcontent.competences.id',
      tubeId: 'learningcontent.tubes.id',
    })
    .join('learningcontent.competences', 'learningcontent.tubes.competenceId', 'learningcontent.competences.id')
    .join('learningcontent.skills', 'learningcontent.skills.tubeId', 'learningcontent.tubes.id')
    .join('learningcontent.challenges', 'learningcontent.challenges.skillId', 'learningcontent.skills.id')
    .where('learningcontent.competences.origin', '=', 'Pix')
    .where('learningcontent.skills.status', 'actif')
    .where((queryBuilder) => {
      queryBuilder.whereRaw('? = ANY(learningcontent.challenges.locales)', ['fr']);
      queryBuilder.orWhereRaw('? = ANY(learningcontent.challenges.locales)', ['fr-fr']);
    })
    .orderBy('learningcontent.tubes.id');
  const tubesByCompetenceId = Object.groupBy(tubeDTOs, (tubeDTO: { competenceId: string }) => tubeDTO.competenceId);
  const tubeIds = [];
  for (const tubesForCompetence of Object.values(tubesByCompetenceId)) {
    tubeIds.push(...tubesForCompetence.slice(0, 2).map((tubeDTO) => tubeDTO.tubeId));
  }
  for (const tubeId of tubeIds) {
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId,
      tubeId,
      level: 3,
    });
  }
  await databaseBuilder.commit();
});

test('user plays a campaign', async ({ pixAppUserContext, pixOrgaProContext, testMode }) => {
  test.setTimeout(180_000);
  let results;
  const resultFilePath = './tests/evaluations/data/campaign-evaluation.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
      masteryPercentages: [],
    };
  } else {
    results = await fs.readFile(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }
  const pixOrgaPage = await pixOrgaProContext.newPage();
  await pixOrgaPage.goto(process.env.PIX_ORGA_URL);
  let campaignCode: string;
  await test.step('creates the campaign', async () => {
    await pixOrgaPage.getByRole('link', { name: 'Créer une campagne' }).click();
    const createCampaignPage = new CreateCampaignPage(pixOrgaPage);
    await createCampaignPage.createEvaluationCampaign({
      campaignName: 'test playwright',
      targetProfileName: 'PC PLAYWRIGHT',
    });
    campaignCode = await pixOrgaPage.locator('dd.campaign-header-title__campaign-code > span').textContent();
  });

  const pixAppPage = await pixAppUserContext.newPage();
  await pixAppPage.goto(process.env.PIX_APP_URL);
  const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 1, numWrong: 1 });
  await test.step('plays the campaign', async () => {
    await pixAppPage.getByRole('link', { name: "J'ai un code" }).click();
    const startCampaignPage = new StartCampaignPage(pixAppPage);
    await startCampaignPage.goToFirstChallenge(campaignCode);
    let challengeIndex = 0;
    await test.step(` answering right or wrong according to pattern`, async () => {
      while (!pixAppPage.url().endsWith('/checkpoint?finalCheckpoint=true')) {
        const challengePage = new ChallengePage(pixAppPage);
        const challengeImprint = await challengePage.getChallengeImprint();
        if (testMode === 'record') {
          results.challengeImprints.push(challengeImprint);
        } else {
          expect(challengeImprint).toBe(results.challengeImprints[challengeIndex]);
          await expect(pixAppPage.getByLabel('Votre progression')).toContainText(
            `Question ${(challengeIndex % 5) + 1} / 5`,
          );
        }
        ++challengeIndex;
        await challengePage.setRightOrWrongAnswer(rightWrongAnswerCycleIter.next().value as boolean);
        await challengePage.validateAnswer();

        if (pixAppPage.url().includes('/checkpoint') && !pixAppPage.url().includes('finalCheckpoint=true')) {
          const checkpointPage = new IntermediateCheckpointPage(pixAppPage);
          await checkpointPage.goNext();
        }
      }
    });

    await test.step(`campaign results`, async () => {
      const finalCheckpointPage = new FinalCheckpointPage(pixAppPage);
      await finalCheckpointPage.goToResults();

      const campaignResultsPage = new CampaignResultsPage(pixAppPage);
      const globalMasteryPercentage = await campaignResultsPage.getGlobalMasteryPercentage();
      if (testMode === 'record') {
        results.masteryPercentages.push(globalMasteryPercentage);
      } else {
        expect(globalMasteryPercentage).toBe(results.masteryPercentages[0]);
      }
      let competenceIndex = 1;
      for (const competenceTitle of COMPETENCE_TITLES) {
        const masteryPercentage = await campaignResultsPage.getMasteryPercentageForCompetence(competenceTitle);
        if (testMode === 'record') {
          results.masteryPercentages.push(masteryPercentage);
        } else {
          expect(masteryPercentage).toBe(results.masteryPercentages[competenceIndex]);
        }
        ++competenceIndex;
      }

      if (testMode === 'check') {
        await campaignResultsPage.sendResults();
        await expect(pixAppPage.getByText('Vos résultats ont été envoyés')).toBeVisible();
      }
    });
  });
  if (testMode === 'record') {
    await fs.writeFile(resultFilePath, JSON.stringify(results));
  }
});
