import { test, expect } from '@playwright/test';

test.describe('Profils cibles', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Créer un profil cible et ses clés de lecture', async ({ page, browserName }) => {
    // Création du profil cible
    await page
      .getByRole('listitem')
      .filter({ has: page.getByRole('tooltip', { name: 'Profils cibles', includeHidden: true }) })
      .click();
    await page.getByRole('link', { name: 'Nouveau profil cible' }).click();
    await page.getByLabel('Nom (obligatoire) :').fill('Mon profil cible');
    await page.getByPlaceholder('7777').fill('1');
    await page.getByRole('button', { name: '1 · Savoirs essentiels' }).click();
    await page.getByRole('button', { name: '1.4 Français' }).click();
    await page.getByRole('checkbox', { name: 'Test 4' }).click();
    await page.getByRole('cell', { name: 'Sélection du niveau du sujet suivant : Grammaire' }).getByRole('button').click();
    await page.getByRole('option', { name: '4' }).click();
    await page.getByRole('cell', { name: 'Sélection du niveau du sujet suivant : Vocabulaire' }).getByRole('button').click();
    await page.getByRole('option', { name: '6' }).click();
    await page.getByRole('button', { name: 'Créer le profil cible' }).click();

    await expect.soft(page.getByRole('heading', { name: 'Mon profil cible' })).toBeVisible();
    await expect.soft(page.getByText('Organisation de référence : 1')).toBeVisible();

    await page.getByRole('button', { name: '1 · Savoirs essentiels' }).click();
    await page.getByRole('button', { name: '1.4 Français' }).click();

    await expect.soft(page.getByRole('cell', { name: 'Test 4' })).toBeVisible();
    await expect.soft(page.getByRole('cell', { name: 'grammaire : Grammaire' })).toBeVisible();
    await expect.soft(page.getByRole('cell', { name: 'vocabulaire : Vocabulaire' })).toBeVisible();

    // Création du RT
    await page.getByRole('link', { name: 'Clés de lecture' }).click();
    await page.getByRole('link', { name: 'Nouveau résultat thématique' }).click();
    await page.getByLabel('Nom du résultat thématique :').fill('Mon super RT');
    await page.getByPlaceholder('exemple: clea_num.svg').fill('border-collie.svg');
    await page.getByLabel("Texte alternatif pour l'image :").fill('Le plus beau chien du monde');
    await page.getByLabel('Message :').fill('Message du RT');
    await page.getByLabel("Clé").fill(`BORDER_COLLIE_${browserName}`);
    await page.getByLabel('Lacunes :').check();

    await page.getByLabel("Sur l'ensemble du profil cible").check();
    const critereGlobal = page.locator('section').filter({ hasText: 'Critère d’obtention sur l’ensemble du profil cible' });
    await critereGlobal.getByLabel('Taux de réussite requis').fill('80');

    await page.getByLabel('Sur une sélection de sujets du profil cible').check();
    const premierCritereSurSelection = page
      .locator('section')
      .filter({ hasText: 'Critère d’obtention sur une sélection de sujets du profil cible' })
      .nth(0);
    await premierCritereSurSelection.getByLabel('Nom du critère').fill('Critère 1');
    await premierCritereSurSelection.getByLabel('Taux de réussite requis').fill('20');
    await premierCritereSurSelection.getByRole('button', { name: '1 · Savoirs essentiels' }).click();
    await premierCritereSurSelection.getByRole('button', { name: '1.4 Français' }).click();
    await premierCritereSurSelection.getByRole('checkbox', { name: 'grammaire : Grammaire' }).check();
    await premierCritereSurSelection
      .getByRole('cell', { name: 'Sélection du niveau du sujet suivant : Grammaire' })
      .getByRole('button')
      .click();
    await premierCritereSurSelection.getByRole('option', { name: '2' }).click();

    await page.getByRole('button', { name: 'Ajouter une nouvelle sélection de sujets' }).click();
    const deuxiemeCritereSurSelection = page
      .locator('section')
      .filter({ hasText: 'Critère d’obtention sur une sélection de sujets du profil cible' })
      .nth(1);
    await deuxiemeCritereSurSelection.getByLabel('Nom du critère').fill('Critère 2');
    await deuxiemeCritereSurSelection.getByLabel('Taux de réussite requis').fill('50');
    await deuxiemeCritereSurSelection.getByRole('button', { name: '1 · Savoirs essentiels' }).click();
    await deuxiemeCritereSurSelection.getByRole('button', { name: '1.4 Français' }).click();
    await deuxiemeCritereSurSelection.getByRole('checkbox', { name: 'vocabulaire : Vocabulaire' }).check();

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
    await page.getByRole('link', { name: 'Mon profil cible' }).click();
    await page.getByLabel('Palier par niveau').check();
    await page.getByRole('button', { name: 'Nouveau palier' }).click();
    await page.getByRole('button', { name: 'Nouveau palier' }).click();
    await page.getByRole('textbox', { name: 'Titre du palier' }).nth(0).fill('Titre palier 0');
    await page.getByRole('textbox', { name: 'Message du palier' }).nth(0).fill('Message palier 0');
    await page.getByRole('button', { name: '0' }).nth(1).click();
    await page.getByRole('option', { name: '2' }).click();
    await page.getByRole('textbox', { name: 'Titre du palier' }).nth(1).fill('Titre palier 2');
    await page.getByRole('textbox', { name: 'Message du palier' }).nth(1).fill('Message palier 2');
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect.soft(page.getByText('Titre palier 0')).toBeVisible();
    await expect.soft(page.getByText('Titre palier 2')).toBeVisible();
    await page
      .getByRole('row', { name: 'Informations sur le palier Titre palier 2' })
      .getByRole('link', { name: 'Voir détail' })
      .click();
    await expect.soft(page.getByText('Titre : Titre palier 2')).toBeVisible();
    await expect.soft(page.getByText('Message : Message palier 2')).toBeVisible();
    await page.getByRole('button', { name: 'Éditer' }).click();
    await page.getByLabel('Titre pour le prescripteur').fill('Titre prescripteur palier 2');
    await page.getByLabel('Description pour le prescripteur').fill('Description prescripteur palier 2');
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Titre pour le prescripteur : Titre prescripteur palier 2')).toBeVisible();
    await expect(page.getByText('Description pour le prescripteur : Description prescripteur palier 2'))
      .toBeVisible();
  });
});
