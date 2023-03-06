import { test, expect } from './test';

test.describe('Contenus formatifs', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  })

  test('créer un contenu formatif', async ({ menuNavigation, page }) => {
    await menuNavigation.click('Contenus formatifs');

    // Création du contenu formatif
    await page.getByRole('link', { name: 'Nouveau contenu formatif' }).click();
    await page.getByRole('textbox', { name: 'Titre' }).fill('Fast aerial');
    await page.getByRole('textbox', { name: 'Lien' }).fill('https://rocketleague.lol/fast-aerial-tutorial');
    await page.getByRole('button', { name: 'Sélectionnez un format' }).click();
    await page.getByRole('option', { name: 'Parcours d\'autoformation' }).click();
    await page.getByRole('spinbutton', { name: 'Heures (HH)' }).fill('4');
    await page.getByRole('button', { name: 'Sélectionnez une langue' }).click();
    await page.getByRole('option', { name: 'Anglais (en-gb)' }).click();
    await page.getByRole('textbox', { name: 'Nom du fichier du logo éditeur' }).fill('rocket-league.svg');
    await page.getByRole('textbox', { name: 'Nom de l\'éditeur' }).fill('Epic games');
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
