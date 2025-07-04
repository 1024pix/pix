import { expect } from '@playwright/test';

import { getAuthStatePath, getGarTokenForExistingUser, LOGGED_APP_USER_ID } from '../helpers/auth.ts';
import { databaseBuilder } from '../helpers/db.ts';
import { test } from '../helpers/fixtures.ts';

test('authenticates user to pix app', async ({ page }) => {
  const user = databaseBuilder.factory.buildUser.withRawPassword({ id: LOGGED_APP_USER_ID });
  await databaseBuilder.commit();

  // visit login page
  await page.goto('/');
  await expect(page).toHaveTitle('Connexion | Pix');

  // logs in
  const loginInput = page.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' });
  await loginInput.fill(user.email);

  const passwordInput = page.getByRole('textbox', { name: 'Mot de passe' });
  await passwordInput.fill('pix123');

  const connectButton = page.getByRole('button', { name: 'Je me connecte' });
  await connectButton.click();

  // wait for connexion
  await expect(page).toHaveTitle('Accueil | Pix');

  // save auth state
  await page.context().storageState({ path: getAuthStatePath('pix-app') });
});

test('authenticates GAR user to pix app', async ({ page }) => {
  const user = databaseBuilder.factory.buildUser.withRawPassword({ id: LOGGED_APP_USER_ID });
  await databaseBuilder.commit();

  // visit login page
  const token = getGarTokenForExistingUser(user.id);
  await page.goto(`/connexion/gar#${token}`);

  // wait for connexion
  await expect(page).toHaveTitle('Accueil | Pix');

  // save auth state
  await page.context().storageState({ path: getAuthStatePath('pix-app-gar') });
});
