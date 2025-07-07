import { Page } from '@playwright/test';

import { buildAuthenticatedUsers } from '../../helpers/db.ts';
import { PIX_ORGA_PRO_DATA } from '../../helpers/db-data.ts';
import { expect, test } from '../../helpers/fixtures.ts';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: false });
});

test('authenticates user to pix orga', async ({ page }: { page: Page }) => {
  await page.goto(process.env.PIX_ORGA_URL as string);
  await expect(page).toHaveTitle('Connectez-vous | Pix Orga (hors France)');

  await page.getByLabel('Adresse e-mail').fill(PIX_ORGA_PRO_DATA.email);
  await page.getByLabel('Mot de passe').fill(PIX_ORGA_PRO_DATA.rawPassword);

  await page.getByRole('button', { name: 'Je me connecte' }).click();

  const cgu = page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation (CGU)" });
  await cgu.waitFor();
  await page.getByRole('button', { name: 'Accepter et continuer' }).click();

  await expect(page).toHaveURL(/campagnes\/les-miennes$/);
});
