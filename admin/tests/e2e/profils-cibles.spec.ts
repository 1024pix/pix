import { test, expect } from '@playwright/test';

test.describe('Profils cibles', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Créer un profil cible et ses clés de lecture', async ({ page }) => {
    // Création du profil cible
    await page
      .getByRole('listitem')
      .filter({ has: page.getByRole('tooltip', { name: 'Profils cibles', includeHidden: true }) })
      .click();
    await page.getByRole('link', { name: 'Nouveau profil cible' }).click();
    await page.getByLabel('Nom (obligatoire) :').fill('Mon profil cible');
    await page.getByPlaceholder('7777').fill('1');
    await page.getByRole('button', { name: '3 · Création de contenu' }).click();
    await page.getByRole('button', { name: '3.4 Programmer' }).click();
    await page.getByLabel('Programme', { exact: true }).check();
    await page
      .getByRole('cell', { name: 'Sélection du niveau du sujet suivant : Programme 8' })
      .getByRole('button', { name: '8' })
      .click();
    await page.getByRole('option', { name: '4' }).click();
    await page.getByRole('button', { name: 'Créer le profil cible' }).click();
    await page.getByRole('button', { name: '3 · Création de contenu' }).click();
    await page.getByRole('button', { name: '3.4 Programmer' }).click();
    await expect.soft(page.getByRole('heading', { name: 'Mon profil cible' })).toBeVisible();
    await expect.soft(page.getByText('Organisation de référence : 1')).toBeVisible();
    await expect.soft(page.getByRole('button', { name: '3 · Création de contenu' })).toBeVisible();
    await expect.soft(page.getByRole('button', { name: '3.4 Programmer' })).toBeVisible();

    // Création du RT
    await page.getByRole('link', { name: 'Clés de lecture' }).click();
    await page.getByRole('link', { name: 'Nouveau résultat thématique' }).click();
    await page.getByLabel('Nom du résultat thématique :').fill('Mon super RT');
    await page.getByPlaceholder('exemple: clea_num.svg').fill('border-collie.svg');
    await page.getByLabel("Texte alternatif pour l'image :").fill('Le plus beau chien du monde');
    await page.getByLabel('Message :').fill('Message du RT');
    await page.getByLabel("Clé (texte unique , vérifier qu'il n'existe pas) :").fill('BORDER_COLLIE');
    await page.getByLabel('Lacunes :').check();
    await page.getByLabel("Sur l'ensemble du profil cible").check();
    await page.locator('#campaignThreshold').fill('80');
    await page.getByLabel('Sur une sélection de sujets du profil cible').check();
    await page.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }).click();
    await page.locator('#cappedTubeCriterion0criterionName').fill('Critère 1');
    await page.locator('#cappedTubeCriterion0').fill('20');
    await page.getByRole('button', { name: '3 · Création de contenu' }).nth(0).click();
    await page.getByRole('button', { name: '3.4 Programmer' }).nth(0).click();
    await page.getByLabel('@baseDeDonnées', { exact: false }).check();
    await page
      .getByRole('cell', { name: 'Sélection du niveau du sujet suivant : Requête SQL 8' })
      .getByRole('button', { name: '8' })
      .click();
    await page.getByRole('option', { name: '4' }).click();
    await page.locator('#cappedTubeCriterion1criterionName').fill('Critère 2');
    await page.locator('#cappedTubeCriterion1').fill('50');
    await page.getByRole('button', { name: '3 · Création de contenu' }).nth(1).click();
    await page.getByRole('button', { name: '3.4 Programmer' }).nth(1).click();
    await page.getByLabel('Programme', { exact: true }).nth(1).check();
    await page.getByRole('button', { name: 'Enregistrer le RT' }).click();
    await page.getByRole('link', { name: 'Détails du badge Mon super RT' }).click();
    await expect.soft(page.getByText('Nom du résultat thématique : Mon super RT')).toBeVisible();
    await expect.soft(page.getByText("Nom de l'image : border-collie.svg")).toBeVisible();
    await expect.soft(page.getByText('Clé : BORDER_COLLIE')).toBeVisible();
    await expect.soft(page.getByText('Message : Message du RT')).toBeVisible();
    await expect.soft(page.getByText('Message alternatif : Le plus beau chien du monde')).toBeVisible();
    await expect.soft(page.getByText('Lacunes')).toBeVisible();
    await expect.soft(page.getByText('Nom du résultat thématique : Mon super RT')).toBeVisible();

    // Création des paliers
  });
});
