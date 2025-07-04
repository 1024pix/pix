import { expect } from '@playwright/test';
import * as fs from 'fs';

import { getAuthStatePath } from '../helpers/auth.js';
import { COMPETENCE_TITLES } from '../helpers/constants';
import { commonSeeds } from '../helpers/db.js';
import { test } from '../helpers/fixtures';
import { rightWrongAnswerCycle } from '../helpers/utils';
import {
  CampaignResultsPage,
  ChallengePage,
  FinalCheckpointPage,
  IntermediateCheckpointPage,
  StartCampaignPage,
} from '../pages/pix-app';
import { CreateCampaignPage } from '../pages/pix-orga';

test.beforeEach(async () => {
  await commonSeeds();
});

test('user plays a campaign', async ({ browser, testMode }) => {
  test.setTimeout(180_000);
  let results;
  const resultFilePath = './next-challenge-regression/campaign-evaluation.json';
  if (testMode === 'record') {
    results = {
      challengeImprints: [],
      masteryPercentages: [],
    };
  } else {
    results = fs.readFileSync(resultFilePath, 'utf-8');
    results = JSON.parse(results);
  }
  const pixOrgaContext = await browser.newContext({ storageState: getAuthStatePath('pix-orga') });
  const pixOrgaPage = await pixOrgaContext.newPage();
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

  const pixAppContext = await browser.newContext({ storageState: getAuthStatePath('pix-app') });
  const pixAppPage = await pixAppContext.newPage();
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
    });
  });
  if (testMode === 'record') {
    fs.writeFileSync(resultFilePath, JSON.stringify(results));
  }
});
