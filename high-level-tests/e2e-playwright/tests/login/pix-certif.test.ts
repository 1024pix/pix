import { buildAuthenticatedUsers } from '../../helpers/db';
import { PIX_CERTIF_PRO_DATA } from '../../helpers/db-data';
import { expect, test } from '../../helpers/fixtures';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: false });
});

test('authenticates user to pix certif', async ({ page }) => {
  await page.goto(process.env.PIX_CERTIF_URL);
  await expect(page.getByRole('heading')).toContainText('Connectez-vous');
  await expect(page.locator('header')).toContainText(
    "L'accès à Pix Certif est limité aux centres de certification Pix.",
  );

  const loginInput = page.getByRole('textbox', { name: 'Adresse e-mail' });
  await loginInput.fill(PIX_CERTIF_PRO_DATA.email);

  const passwordInput = page.getByRole('textbox', { name: 'Mot de passe' });
  await passwordInput.fill(PIX_CERTIF_PRO_DATA.rawPassword);

  const connectButton = page.getByRole('button', { name: 'Je me connecte' });
  await connectButton.click();

  const cgu = page.getByRole('heading', { name: "Conditions générales d'utilisation de la plateforme Pix Certif" });
  await cgu.waitFor();
  await page.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }).click();

  await expect(page).toHaveURL(/sessions$/);
});
