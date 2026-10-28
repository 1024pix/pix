import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixOrgaUserWithGenericImport } from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-app/index.ts';
import { PixOrgaPage } from '../../pages/pix-orga/index.ts';

let uid: string;
let testData: {
  userId: number;
  targetProfileId: number;
  campaignCode: string;
  campaignId: number;
  organizationId: number;
};

test.beforeEach(async () => {
  uid = randomUUID().slice(-8);
  testData = await buildFreshPixOrgaUserWithGenericImport(
    'Adi',
    'Minh',
    `admin-${uid}@example.net`,
    'pix123',
    'ADMIN',
    uid,
    {
      type: 'PRO',
      externalId: `GENERIC_ORG-${uid}`,
      isManagingStudents: false,
    },
  );
});

test('Managing generic import learners', async ({ page }) => {
  test.slow();
  const orgaPage = new PixOrgaPage(page);

  await test.step('Login to pixOrga', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await orgaPage.login(`admin-${uid}@example.net`, 'pix123');
    await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
    await orgaPage.acceptCGU();
  });

  await test.step('Import learners', async () => {
    await page.getByRole('link', { name: 'Participants' }).click();
    await page.getByRole('link', { name: 'Importer', exact: true }).click();
    await orgaPage.importFile(path.join(import.meta.dirname, '..', '..', 'data', 'generic-ok.csv'));
  });

  await test.step('Show learners', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await page.getByRole('link', { name: 'Participants' }).click();
    await expect(page.getByRole('heading', { name: 'Participants (3)' })).toBeVisible();
  });

  await test.step('Access the campaign and reconcile a new user with an imported learner', async () => {
    // Access campaign
    await page.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Isaac', 'Asimov', `asimov.${uid}@example.net`, 'oaiejf*(Uo;aise9821');
    await page.getByRole('link', { name: "J'ai un code" }).click();
    await page.getByLabel('Saisir votre code pour').fill(testData.campaignCode);
    await page.getByRole('button', { name: 'Accéder au parcours' }).click();
    await page.getByRole('button', { name: 'Je commence' }).click();

    // Wait for reconciliation page
    await expect(page.getByRole('heading', { name: /Orga pro/ })).toBeVisible();

    // Fill in the reconciliation form
    await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('Charlie');
    await page.getByRole('textbox', { name: 'Prénom' }).fill('Bernard');
    await page.getByLabel('Date de naissance').fill('10/10/2010');

    // Submit the form
    await page.getByRole('button', { name: "C'est parti" }).click();

    // Start (and end) campaign
    await page.getByRole('button', { name: 'Ignorer' }).click();
    await expect(page.getByRole('heading', { name: 'Vous avez déjà répondu' })).toBeVisible();
  });
});
