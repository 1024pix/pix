import { randomUUID } from 'node:crypto';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixOrgaUser } from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-app/LoginPage.ts';
import { StartCampaignPage } from '../../pages/pix-app/StartCampaignPage.ts';
import { PixOrgaPage } from '../../pages/pix-orga/PixOrgaPage.ts';

let uid: string;

test.beforeEach(async () => {
  uid = randomUUID().slice(-8);
  await buildFreshPixOrgaUser('Adi', 'Minh', `admin-${uid}@example.net`, 'pix123', 'ADMIN', {
    type: 'PRO',
    externalId: `PRO_NOT_MANAGING-${uid}`,
    isManagingStudents: false,
  });
});

test('Profile collection campaign', async ({ page }) => {
  let campaignCode: string;
  const campaignName = 'Profile collection campaign';

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
    await orgaPage.createProfileCollectionCampaign({ campaignName });
    campaignCode = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';
  });

  await test.step('plays campaign', async function () {
    await page.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${uid}@example.net`, 'Coucoulesdevs66');

    await page.getByRole('link', { name: "J'ai un code" }).click();
    const startCampaignPage = new StartCampaignPage(page);
    await startCampaignPage.completeProfileCollectionCampaign(campaignCode);
  });

  await test.step('view campaign results', async function () {
    await page.goto(process.env.PIX_ORGA_URL as string);

    await page.getByLabel('Navigation principale').getByRole('link', { name: 'Campagnes' }).click();
    await page.getByRole('link', { name: campaignName, exact: true }).click();
    await expect(page.getByRole('heading', { name: campaignName })).toBeVisible();
    await expect(
      page.getByRole('region').filter({ hasText: 'Participations terminées' }).getByRole('definition'),
    ).toBeVisible();
    await expect(
      page.getByRole('region').filter({ hasText: 'Total de participants' }).getByRole('definition'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voir les résultats de Buffy' })).toBeVisible();
  });
});
