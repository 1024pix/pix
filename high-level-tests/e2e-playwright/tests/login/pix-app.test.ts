import { buildAuthenticatedUsers } from '../../helpers/db';
import { PIX_APP_USER_DATA } from '../../helpers/db-data';
import { expect, test } from '../../helpers/fixtures';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: false });
});

test('authenticates user to pix app', async ({ page }) => {
  await page.goto(process.env.PIX_APP_URL);
  await expect(page).toHaveTitle('Connexion | Pix');

  const loginInput = page.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' });
  await loginInput.fill(PIX_APP_USER_DATA.email);

  const passwordInput = page.getByRole('textbox', { name: 'Mot de passe' });
  await passwordInput.fill(PIX_APP_USER_DATA.rawPassword);

  const connectButton = page.getByRole('button', { name: 'Je me connecte' });
  await connectButton.click();

  await expect(page).toHaveTitle('Accueil | Pix');
});
/*
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
*/
