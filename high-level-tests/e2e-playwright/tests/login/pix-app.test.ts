import { Page } from '@playwright/test';

import { getGarTokenForExistingUser } from '../../helpers/auth.ts';
import { buildAuthenticatedUsers } from '../../helpers/db.ts';
import { PIX_APP_USER_DATA } from '../../helpers/db-data.ts';
import { expect, test } from '../../helpers/fixtures.ts';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: false });
});

test('authenticates user to pix app', async ({ page }: { page: Page }) => {
  await page.goto(process.env.PIX_APP_URL as string);
  await expect(page).toHaveTitle('Connexion | Pix');

  await page.getByLabel('Adresse e-mail ou identifiant').fill(PIX_APP_USER_DATA.email);
  await page.getByLabel('Mot de passe').fill(PIX_APP_USER_DATA.rawPassword);

  await page.getByRole('button', { name: 'Je me connecte' }).click();

  await expect(page).toHaveTitle('Accueil | Pix');
});

test('authenticates GAR user to pix app', async ({ page }) => {
  const token = getGarTokenForExistingUser(PIX_APP_USER_DATA.id);
  await page.goto(process.env.PIX_APP_URL + `/connexion/gar#${token}`);

  await expect(page).toHaveTitle('Accueil | Pix');
});
