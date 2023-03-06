import { test, expect } from './test';

test.describe('Utilisateurs', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('consulter le détail d\'un utilisateur', async ({ menuNavigation, page }) => {
    await menuNavigation.click('Utilisateurs');

    // Recherche d'un utilisateur
    await page.getByRole('textbox', { name: 'Prénom' }).fill('super');
    await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('admin');
    await page.getByRole('button', { name: 'Charger' }).click();

    const userRows = page.getByRole('row');
    await expect.soft(userRows).toHaveCount(1);
    await expect.soft(userRows.getByRole('cell', { name: 'Super', exact: true })).toBeVisible();
    await expect.soft(userRows.getByRole('cell', { name: 'Admin', exact: true })).toBeVisible();
    await expect.soft(userRows.getByRole('cell', { name: 'superadmin@example.net' })).toBeVisible();

    // Consultation du détail
    await userRows.getByRole('link', { name: /^\d+$/ }).click();

    await expect.soft(page.getByRole('heading', { name: 'Informations de l\'utilisateur' })).toBeVisible();
    await expect.soft(page.getByText('Prénom : Super')).toBeVisible();
    await expect.soft(page.getByText('Nom : Admin', { exact: true })).toBeVisible();
    await expect.soft(page.getByText('Langue : FR')).toBeVisible();
    await expect.soft(page.getByText('Adresse e-mail : superadmin@example.net')).toBeVisible();

    // Navigation dans les onglets
    await page.getByRole('link', { name: 'Profil' }).click();
    await expect.soft(page.getByRole('heading', { name: 'Profil utilisateur' })).toBeVisible();
    await page.getByRole('link', { name: 'Participations' }).click();
    await expect.soft(page.getByRole('heading', { name: 'Participations à des campagnes' })).toBeVisible();
    await page.getByRole('link', { name: 'Organisations de l’utilisateur' }).click();
    await expect.soft(page.getByRole('heading', { name: 'Organisations de l’utilisateur' })).toBeVisible();
    await page.getByRole('link', { name: 'Centres de certification auxquels appartient l´utilisateur' }).click();
    await expect.soft(page.getByRole('heading', { name: 'Centres de certification de l’utilisateur' })).toBeVisible();
  })
})
