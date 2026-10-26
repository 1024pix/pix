import { randomUUID } from 'node:crypto';

import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixCertifUser } from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-certif/index.js';

let uid: string;
test.beforeEach(function () {
  uid = randomUUID().slice(-4);
});

test('login, cgu and logout', async ({ page }: { page: Page }) => {
  const email = `buffy.summers.${uid}@example.net`;
  await buildFreshPixCertifUser('Buffy', 'Summers', email, 'Coucoulesdevs66');
  await page.goto(process.env.PIX_CERTIF_URL as string);

  await test.step('Login for the first time to PixCertif and accept CGUs', async () => {
    await expect(page.getByRole('heading')).toContainText('Connectez-vous');
    await expect(page.locator('header')).toContainText(
      "L'accès à Pix Certif est limité aux centres de certification Pix.",
    );

    const loginPage = new LoginPage(page);
    await loginPage.login(email, 'Coucoulesdevs66');
    const cgu = page.getByRole('heading', {
      name: "Conditions générales d'utilisation de la plateforme Pix Certif",
    });
    await cgu.waitFor();
    await loginPage.acceptCGU();

    await expect(page).toHaveURL(/sessions$/);
  });

  await test.step('Logout and login, without having to accept CGU', async function () {
    await page.getByRole('link', { name: 'Se déconnecter' }).click();

    await expect(page.getByRole('heading')).toContainText('Connectez-vous');
    await expect(page.locator('header')).toContainText(
      "L'accès à Pix Certif est limité aux centres de certification Pix.",
    );

    const loginPage = new LoginPage(page);
    await loginPage.login(email, 'Coucoulesdevs66');

    await expect(page).toHaveURL(/sessions$/);
  });
});
