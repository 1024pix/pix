import {
  ChallengePage,
  FinalCheckpointPage,
  IntermediateCheckpointPage,
  LoginPage,
  StartCampaignPage,
} from '../../pages/pix-app/index.ts';
import { PixOrgaPage } from '../../pages/pix-orga/index.ts';
import { test as sharedTest } from '../index.ts';

export const test = sharedTest.extend<{ createOrganizationLearnerOfUserToAnonymize: boolean }>({
  createOrganizationLearnerOfUserToAnonymize: async ({ page: pixAppPage, pixOrgaMemberContext }, use) => {
    const pixOrgaPage = await pixOrgaMemberContext.newPage();
    await pixOrgaPage.goto(process.env.PIX_ORGA_URL as string);
    let campaignCode: string | null;
    await test.step('creates the campaign', async () => {
      await pixOrgaPage.getByRole('link', { name: 'Campagnes', exact: true }).click();
      await pixOrgaPage.getByRole('link', { name: 'Créer une campagne' }).click();
      const createCampaignPage = new PixOrgaPage(pixOrgaPage);
      await createCampaignPage.createEvaluationCampaign({
        campaignName: 'test playwright',
        targetProfileName: 'petit Profile Cible',
      });
      campaignCode = await pixOrgaPage.locator('dd.campaign-header-title__campaign-code > span').textContent();
    });

    await pixAppPage.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(pixAppPage);
    await loginPage.signup('Jambon', 'Beurre', `jambon.beurre@example.net`, 'Coucoulesdevs44');
    await test.step('plays the campaign', async () => {
      await pixAppPage.getByRole('link', { name: "J'ai un code" }).click();
      const startCampaignPage = new StartCampaignPage(pixAppPage);
      await startCampaignPage.goToFirstChallenge(campaignCode as string);
      await test.step(` answering right or wrong according to pattern`, async () => {
        while (!pixAppPage.url().endsWith('/checkpoint?finalCheckpoint=true')) {
          const challengePage = new ChallengePage(pixAppPage);
          await challengePage.setRightOrWrongAnswer(true);
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

        await expect(
          pixAppPage.getByRole('paragraph').filter({ hasText: 'Vos résultats ont été envoyés' }),
        ).toBeVisible();
      });
    });
    const coucou = true;
    await use(coucou);
  },
});

export const expect = test.expect;
