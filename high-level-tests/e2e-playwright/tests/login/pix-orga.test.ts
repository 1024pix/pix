import { buildAuthenticatedUsers } from '../../helpers/db';
import { PIX_ORGA_PRO_DATA } from '../../helpers/db-data';
import { expect, test } from '../../helpers/fixtures';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: false });
});

test('authenticates user to pix orga', async ({ page }) => {
  await page.goto(process.env.PIX_ORGA_URL);
  await expect(page).toHaveTitle('Connectez-vous | Pix Orga (hors France)');

  const loginInput = page.getByRole('textbox', { name: 'Adresse e-mail' });
  await loginInput.fill(PIX_ORGA_PRO_DATA.email);

  const passwordInput = page.getByRole('textbox', { name: 'Mot de passe' });
  await passwordInput.fill(PIX_ORGA_PRO_DATA.rawPassword);

  const connectButton = page.getByRole('button', { name: 'Je me connecte' });
  await connectButton.click();

  const cgu = page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation (CGU)" });
  await cgu.waitFor();
  await page.getByRole('button', { name: 'Accepter et continuer' }).click();

  await expect(page).toHaveURL(/campagnes\/les-miennes$/);
});
