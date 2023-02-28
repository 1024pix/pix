import { test, expect } from '@playwright/test';

test.describe('Contenus formatifs', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  })

  test('créer un contenu formatif', async ({ page }) => {
    // Navigation
    await page
      .getByRole('listitem')
      .filter({ has: page.getByRole('tooltip', { name: 'Contenus formatifs', includeHidden: true }) })
      .click();

    // Création du contenu formatif
    await page.getByRole('link', { name: 'Nouveau contenu formatif' }).click();
    await page.getByLabel('Titre').fill('Fast aerial');
    await page.getByLabel('Lien').fill('https://rocketleague.lol/fast-aerial-tutorial');
    await page.getByRole('button', { name: '-- Sélectionnez un format --' }).click();
    await page.getByRole('option', { name: 'Parcours d\'autoformation' }).click();
    await page.getByLabel('Heures (HH)').fill('4');
    await page.getByRole('button', { name: '-- Sélectionnez une langue --' }).click();
    await page.getByRole('option', { name: 'Anglais (en-gb)' }).click();
    await page.getByPlaceholder('logo-ministere-education-nationale-et-jeunesse.svg').fill('rocket-league.svg');
    await page.getByPlaceholder('Ministère de l\'Éducation nationale et de la Jeunesse. Liberté égalité fraternité.').fill('Epic games');
    await page.getByRole('button', { name: 'Créer le contenu formatif' }).click();

    // Détail du contenu formatif
    await expect.soft(page.getByRole('heading', { name: 'Fast aerial' })).toBeVisible();
    await expect.soft(page.getByText('Publié sur : https://rocketleague.lol/fast-aerial-tutorial')).toBeVisible();
    await expect.soft(page.getByText('Type de contenu : autoformation')).toBeVisible();
    await expect.soft(page.getByText('Durée : 4h')).toBeVisible();
    await expect.soft(page.getByText('Langue localisée : Anglais (en-gb)')).toBeVisible();
    await expect.soft(page.getByText('Nom d\'éditeur : Epic games')).toBeVisible();
    await expect.soft(page.getByText('Logo de l\'éditeur : https://images.pix.fr/contenu-formatif/editeur/rocket-league.svg')).toBeVisible();
  });
})
