import { randomUUID } from 'node:crypto';

import { buildFreshPixOrgaUser } from '../../helpers/db.ts';
import { expect, test } from '../../helpers/fixtures.ts';
import { rightWrongAnswerCycle } from '../../helpers/utils.ts';
import { CampaignResultsPage } from '../../pages/pix-app/CampaignResultsPage.ts';
import { ChallengePage } from '../../pages/pix-app/ChallengePage.ts';
import { FinalCheckpointPage } from '../../pages/pix-app/FinalCheckpointPage.ts';
import { IntermediateCheckpointPage } from '../../pages/pix-app/IntermediateCheckpointPage.ts';
import { LoginPage } from '../../pages/pix-app/LoginPage.ts';
import { StartCampaignPage } from '../../pages/pix-app/StartCampaignPage.ts';
import { PixOrgaPage } from '../../pages/pix-orga/PixOrgaPage.ts';

let uid: string;

test.beforeEach(async () => {
  uid = randomUUID().slice(-8);
  await buildFreshPixOrgaUser('Adi', 'Minh', `admin-${uid}@example.net`, 'pix123', 'ADMIN', {
    type: 'PRO',
    externalId: `PRO_MANAGING-${uid}`,
    isManagingStudents: false,
  });
});

test('Assessment campaign', async ({ page }) => {
  let campaignCode: string;
  let globalMasteryPercentage: string;

  const orgaPage = new PixOrgaPage(page);
  test.slow();

  await test.step('Login to pixOrga', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await orgaPage.login(`admin-${uid}@example.net`, 'pix123');
    await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
    await orgaPage.acceptCGU();
  });

  await test.step('Create a campaign', async () => {
    await page.getByLabel('Navigation principale').getByRole('link', { name: 'Campagnes' }).click();
    await page.getByRole('link', { name: 'Créer une campagne' }).click();
    await orgaPage.createEvaluationCampaign({
      campaignName: 'campagne pro',
      targetProfileName: 'PC pour Playwright',
    });
    campaignCode = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';
  });

  await test.step('plays campaign', async function () {
    await page.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${uid}@example.net`, 'Coucoulesdevs66');
    const rightWrongAnswerCycleIter = rightWrongAnswerCycle({ numRight: 1, numWrong: 1 });

    await page.getByRole('link', { name: "J'ai un code" }).click();
    const startCampaignPage = new StartCampaignPage(page);
    await startCampaignPage.goToFirstChallenge(campaignCode);

    await test.step(`answering right or wrong according to pattern`, async () => {
      while (!page.url().endsWith('/checkpoint?finalCheckpoint=true')) {
        const challengePage = new ChallengePage(page);
        await challengePage.setRightOrWrongAnswer(rightWrongAnswerCycleIter.next().value as boolean);
        await challengePage.validateAnswer();
        if (page.url().includes('/checkpoint') && !page.url().includes('finalCheckpoint=true')) {
          const checkpointPage = new IntermediateCheckpointPage(page);
          await checkpointPage.goNext();
        }
      }
    });

    await test.step(`campaign results`, async () => {
      const finalCheckpointPage = new FinalCheckpointPage(page);
      await finalCheckpointPage.goToResults();

      const campaignResultsPage = new CampaignResultsPage(page);
      globalMasteryPercentage = await campaignResultsPage.getGlobalMasteryPercentage();
      await campaignResultsPage.sendResults();
      await expect(page.getByRole('paragraph').filter({ hasText: 'Vos résultats ont été envoyés' })).toBeVisible();
    });
  });

  await test.step('view campaign results', async function () {
    await page.goto(process.env.PIX_ORGA_URL as string);

    await page.getByLabel('Navigation principale').getByRole('link', { name: 'Campagnes' }).click();
    await page.getByRole('link', { name: 'campagne pro', exact: true }).click();
    await expect(
      page.getByRole('region').filter({ hasText: 'Participations terminées Retrouvez ici' }).getByRole('definition'),
    ).toBeVisible();
    await expect(
      page.getByRole('region').filter({ hasText: 'Total de participants' }).getByRole('definition'),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Résultats (1)' }).click();
    await expect(page.getByRole('definition').filter({ hasText: `%` })).toBeVisible();

    await orgaPage.waitForParticipationScoreComputed(globalMasteryPercentage, page);

    await expect(page.getByRole('definition').filter({ hasText: `${globalMasteryPercentage} %` })).toBeVisible();

    await page.getByRole('cell', { name: 'Buffy' }).click();
    await expect(page.getByLabel('Résultat', { exact: true }).getByText(`${globalMasteryPercentage} %`)).toBeVisible();
  });
});
