import { test, expect } from './test';

test.describe('organisations', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  })

  test('créer une organisation', async ({ menuNavigation, page }) => {
    await menuNavigation.click('Organisations');

    // Création de l'organisation
    await page.getByRole('link', { name: 'Nouvelle organisation' }).click();
    await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('Les bisounours');
    await page.getByRole('button', { name: 'Sélectionner un type d\'organisation' }).click();
    await page.getByRole('option', { name: 'Organisation professionnelle' }).click();
    await page.getByRole('textbox', { name: 'Lien vers la documentation' }).fill('https://bisounours.biz/');
    await page.getByRole('spinbutton', { name: 'Crédits' }).fill('1234');
    await page.getByRole('textbox', { name: 'Prénom du DPO' }).fill('Marie');
    await page.getByRole('textbox', { name: 'Nom du DPO', exact: true }).fill('Clémentine');
    await page.getByRole('textbox', { name: 'Adresse e-mail du DPO' }).fill('marie.clementine@bisounours.biz');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    // Détail de l'organisation
    await expect.soft(page.getByRole('heading', { name: 'Les bisounours' })).toBeVisible();
    await expect.soft(page.getByText('Type : PRO')).toBeVisible();
    await expect.soft(page.getByText('Nom du DPO : Marie Clémentine')).toBeVisible();
    await expect.soft(page.getByText('Adresse e-mail du DPO : marie.clementine@bisounours.biz')).toBeVisible();
    await expect.soft(page.getByText('Crédits : 1234')).toBeVisible();
    await expect.soft(page.getByText('Lien vers la documentation : https://bisounours.biz/')).toBeVisible();

    // Ajout de tag
    await page.getByRole('button', { name: 'PRIVE' }).click();
    await expect.soft(page.getByLabel('Tag PRIVE assigné à l\'organisation')).toBeVisible();

    // Ajout de places
    await page.getByRole('link', { name: 'Places' }).click();
    await page.getByRole('link', { name: 'Ajouter des places' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('321');
    await page.getByRole('button', { name: 'Sélectionnez une catégorie' }).click();
    await page.getByRole('option', { name: 'Tarif plein' }).click();
    await page.getByRole('textbox', { name: 'Référence' }).fill('Des calins');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    // Liste des places
    const placesRow = page.getByRole('row', { name: 'Lot de Places' });
    await expect.soft(placesRow).toHaveCount(1);
    await expect.soft(placesRow.getByRole('cell', { name: '321', exact: true })).toBeVisible();
    await expect.soft(placesRow.getByRole('cell', { name: 'Tarif plein' })).toBeVisible();
    await expect.soft(placesRow.getByRole('cell', { name: 'Actif' })).toBeVisible();
    await expect.soft(placesRow.getByRole('cell', { name: 'Des calins' })).toBeVisible();
  })
})
