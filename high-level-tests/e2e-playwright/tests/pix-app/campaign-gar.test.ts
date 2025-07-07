import { getGarTokenForNewUser } from '../../helpers/auth.js';
import { databaseBuilder } from '../../helpers/db.js';
import { expect, test } from '../../helpers/fixtures.js';

let campaignCode: string;

test.beforeEach(async () => {
  campaignCode = databaseBuilder.factory.buildCampaign().code;
  await databaseBuilder.commit();
});

test('creates an account from GAR', async ({ page }) => {
  const garUserToken = getGarTokenForNewUser('marie', 'toupie');
  await page.goto(process.env.PIX_APP_URL + `/campagnes/?externalUser=${garUserToken}`);
  await expect(page.getByRole('heading', { name: 'Saisissez votre code' })).toBeVisible();

  await page.getByLabel('Saisir votre code pour').fill(campaignCode);
  await page.getByRole('button', { name: 'Accéder au parcours' }).click();
  await expect(page.getByRole('heading', { name: 'Commencez votre parcours Pix' })).toBeVisible();
});
