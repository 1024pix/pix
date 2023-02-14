import { test, expect } from '@playwright/test';

test.describe('Profils cibles', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  })

  test('créer un profil cible', async ({ page }) => {
    await page.getByRole('listitem').filter({ has: page.getByRole('tooltip', { name: 'Profils cibles', includeHidden: true }) }).click();
    await page.getByRole('link', { name: 'Nouveau profil cible' }).click();
    await page.getByLabel('Nom (obligatoire) :').fill('Mon profil cible');
    await page.getByPlaceholder('7777').fill('1');
    await page.getByRole('button', { name: '3 · Création de contenu' }).click();
    await page.getByRole('button', { name: '3.4 Programmer' }).click();
    await page.getByLabel('Programme', { exact: true }).check();
    await page.getByRole('cell', { name: 'Sélection du niveau du sujet suivant : Programme 8' }).getByRole('button', { name: '8' }).click();
    await page.getByRole('option', { name: '4' }).click();
    await page.getByRole('button', { name: 'Créer le profil cible' }).click();
    await expect(page.getByRole('heading', { name: 'Mon profil cible' })).toBeVisible();
  });
})
