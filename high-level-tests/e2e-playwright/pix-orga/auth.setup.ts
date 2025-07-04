import { expect } from '@playwright/test';

import { getAuthStatePath, LOGGED_ORGA_USER_ID } from '../helpers/auth.ts';
import { databaseBuilder } from '../helpers/db.ts';
import { test } from '../helpers/fixtures.ts';

test('authenticates user to pix orga', async ({ page }) => {
  const user = databaseBuilder.factory.buildUser.withMembership({ id: LOGGED_ORGA_USER_ID });
  await databaseBuilder.commit();

  // visit login page
  await page.goto('/');
  await expect(page).toHaveTitle('Connectez-vous | Pix Orga (hors France)');

  // logs in
  const loginInput = page.getByRole('textbox', { name: 'Adresse e-mail' });
  await loginInput.fill(user.email);

  const passwordInput = page.getByRole('textbox', { name: 'Mot de passe' });
  await passwordInput.fill('pix123');

  const connectButton = page.getByRole('button', { name: 'Je me connecte' });
  await connectButton.click();

  // wait for connexion
  const cgu = page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation (CGU)" });
  await cgu.waitFor();

  // save auth state
  await page.context().storageState({ path: getAuthStatePath('pix-orga') });
});
