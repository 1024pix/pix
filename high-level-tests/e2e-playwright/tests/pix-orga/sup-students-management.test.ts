import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixOrgaUser } from '../../helpers/db.ts';
import { PixOrgaPage } from '../../pages/pix-orga/PixOrgaPage.ts';

let uid: string;
test.beforeEach(async () => {
  uid = randomUUID().slice(-8);
  await buildFreshPixOrgaUser('Adi', 'Minh', `admin-${uid}@example.net`, 'pix123', 'ADMIN', {
    type: 'SUP',
    externalId: `SUP_MANAGING-${uid}`,
    isManagingStudents: true,
  });
});

test('Managing sup students', async ({ page }) => {
  test.slow();
  const orgaPage = new PixOrgaPage(page);

  await test.step('Login to pixOrga', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await orgaPage.login(`admin-${uid}@example.net`, 'pix123');
    await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
    await orgaPage.acceptCGU();
  });

  await test.step('Import learners', async () => {
    await page.getByRole('link', { name: 'Étudiants' }).click();
    await page.getByRole('link', { name: 'Importer' }).click();
    await page.getByRole('button', { name: 'Importer une nouvelle liste' }).click();
    await page.getByText('Je confirme avoir bien').click();
    await orgaPage.importFile(
      path.join(import.meta.dirname, '..', '..', 'data', 'sup-ok.csv'),
      '#students-file-upload-replace',
    );
  });
  await test.step('show learners', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await page.getByRole('link', { name: 'Étudiants' }).click();
    await expect(
      page.getByRole('paragraph').filter({ hasText: 'Les participants ont bien été importés' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Étudiants (3)' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Tableau des étudiants trié' })).toBeVisible();
  });
});
