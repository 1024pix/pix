import { expect } from '@playwright/test';

import { useLoggedUser } from '../helpers/auth.ts';
import { databaseBuilder } from '../helpers/db.ts';
import { test } from '../helpers/fixtures.ts';

let campaign: { code: string };

const userId = useLoggedUser('pix-app');

test.beforeEach(async () => {
  databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
  campaign = databaseBuilder.factory.buildCampaign();
  await databaseBuilder.commit();
});

test('starts a campaign with code', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Accueil | Pix');

  await page.getByRole('link', { name: "J'ai un code" }).click();
  await expect(page.getByRole('heading', { name: /saisissez votre code/ })).toBeVisible();

  await page.getByRole('textbox', { name: 'Saisir votre code pour' }).fill(campaign.code);
  await page.getByRole('button', { name: 'Accéder au parcours' }).click();
  await expect(page.getByRole('heading', { name: /prêt à évaluer vos compétences numériques/ })).toBeVisible();

  await page.getByRole('button', { name: 'Je commence' }).click();
  await page.getByRole('button', { name: 'Ignorer' }).click();
  await expect(page.getByRole('heading', { name: 'Vous avez déjà répondu !' })).toBeVisible();

  await page.getByRole('link', { name: 'Voir mes résultats' }).click();
  await expect(page.getByRole('heading', { name: /Bravo/ })).toBeVisible();

  await page.getByRole('button', { name: "J'envoie mes résultats" }).click();
  await expect(page.getByText("Merci d'avoir envoyé vos résultats.")).toBeVisible();
});
