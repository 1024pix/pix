import { randomUUID } from 'node:crypto';

import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixOrgaUser } from '../../helpers/db.ts';
import { PixOrgaPage } from '../../pages/pix-orga/index.js';

let uid: string;
test.beforeEach(function () {
  uid = randomUUID().slice(-4);
});

test('login, cgu and logout', async ({ page }: { page: Page }) => {
  const email = `buffy.summers.${uid}@example.net`;
  await buildFreshPixOrgaUser('Buffy', 'Summers', email, 'Coucoulesdevs66', 'MEMBER', {
    type: 'PRO',
    externalId: 'PROPRO',
    isManagingStudents: false,
  });
  await page.goto(process.env.PIX_ORGA_URL as string);

  await test.step('Login for the first time to PixOrga and accept CGUs', async () => {
    await expect(page).toHaveTitle('Connectez-vous | Pix Orga (hors France)');

    const loginPage = new PixOrgaPage(page);
    await loginPage.login(email, 'Coucoulesdevs66');
    const cgu = page.getByRole('heading', {
      name: "Veuillez accepter nos Conditions Générales d'Utilisation (CGU)",
    });
    await cgu.waitFor();
    await loginPage.acceptCGU();

    await expect(page).toHaveURL(process.env.PIX_ORGA_URL as string);
  });

  await test.step('Logout and login, without having to accept CGU', async function () {
    await page.getByRole('link', { name: 'Se déconnecter' }).click();

    await expect(page).toHaveTitle('Connectez-vous | Pix Orga (hors France)');

    const loginPage = new PixOrgaPage(page);
    await loginPage.login(email, 'Coucoulesdevs66');

    await expect(page).toHaveURL(process.env.PIX_ORGA_URL as string);
  });
});
