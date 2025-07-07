import { Page } from '@playwright/test';

import { buildAuthenticatedUsers } from '../../helpers/db.ts';
import { PIX_CERTIF_PRO_DATA } from '../../helpers/db-data.ts';
import { expect, test } from '../../helpers/fixtures.ts';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: false });
});

test('authenticates user to pix certif', async ({ page }: { page: Page }) => {
  await page.goto(process.env.PIX_CERTIF_URL as string);
  await expect(page.getByRole('heading')).toContainText('Connectez-vous');
  await expect(page.locator('header')).toContainText(
    "L'accès à Pix Certif est limité aux centres de certification Pix.",
  );

  await page.getByLabel('Adresse e-mail').fill(PIX_CERTIF_PRO_DATA.email);
  await page.getByLabel('Mot de passe').fill(PIX_CERTIF_PRO_DATA.rawPassword);

  await page.getByRole('button', { name: 'Je me connecte' }).click();

  const cgu = page.getByRole('heading', { name: "Conditions générales d'utilisation de la plateforme Pix Certif" });
  await cgu.waitFor();
  await page.getByRole('button', { name: 'J’accepte les conditions d’utilisation' }).click();

  await expect(page).toHaveURL(/sessions$/);
});
