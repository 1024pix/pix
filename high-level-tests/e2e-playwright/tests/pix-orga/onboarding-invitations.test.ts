import { Page } from '@playwright/test';

import { buildAuthenticatedUsers, databaseBuilder } from '../../helpers/db.ts';
import { PIX_APP_USER_DATA, PIX_ORGA_PRO_DATA } from '../../helpers/db-data.ts';
import { expect, test } from '../../helpers/fixtures.ts';

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
});

test.skip('A new user joins a new organization from an invitation link', async function ({ page }: { page: Page }) {
  const invitation = databaseBuilder.factory.buildOrganizationInvitation();
  await databaseBuilder.commit();

  await page.goto(process.env.PIX_ORGA_URL + `/rejoindre?invitationId=${invitation.id}&code=${invitation.code}`);
  await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();

  await test.step('signup user', async () => {
    await page.getByLabel('Prénom').fill('mini');
    await page.getByLabel('Nom', { exact: true }).fill('pixou');
    await page.getByLabel('Adresse e-mail').fill('minipixou@example.net');
    await page.getByLabel('Mot de passe').fill('Azerty123*');
    await page.getByRole('checkbox', { name: "Accepter les conditions d'utilisation de Pix" }).check();
    await page.getByRole('button', { name: "Je m'inscris" }).click();
  });

  await page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation" }).waitFor();
  await page.getByRole('button', { name: 'Accepter et continuer' }).click();

  await expect(page.getByRole('heading', { name: 'Campagnes' })).toBeVisible();
});

test('An existing user joins a new organization from an invitation link', async function ({ page }) {
  const invitation = databaseBuilder.factory.buildOrganizationInvitation();
  await databaseBuilder.commit();

  await page.goto(process.env.PIX_ORGA_URL + `/rejoindre?invitationId=${invitation.id}&code=${invitation.code}`);
  await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();

  await test.step('signin user', async () => {
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.getByLabel('Adresse e-mail').fill(PIX_APP_USER_DATA.email);
    await page.getByLabel('Mot de passe').fill(PIX_APP_USER_DATA.rawPassword);
    await page.getByRole('button', { name: 'Je me connecte' }).click();
  });

  await page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation" }).waitFor();
  await page.getByRole('button', { name: 'Accepter et continuer' }).click();

  await expect(page.getByRole('heading', { name: 'Campagnes' })).toBeVisible();
});

test.describe('When user is already authenticated to Pix Orga', () => {
  test('Joins a new organization from an invitation link', async function ({ pixOrgaProContext }) {
    const invitation = databaseBuilder.factory.buildOrganizationInvitation();
    await databaseBuilder.commit();

    const page = await pixOrgaProContext.newPage();
    await page.goto(process.env.PIX_ORGA_URL + `/rejoindre?invitationId=${invitation.id}&code=${invitation.code}`);
    await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();

    await test.step('signin user', async () => {
      await page.getByRole('button', { name: 'Se connecter' }).click();
      await page.getByLabel('Adresse e-mail').fill(PIX_ORGA_PRO_DATA.email);
      await page.getByLabel('Mot de passe').fill(PIX_ORGA_PRO_DATA.rawPassword);
      await page.getByRole('button', { name: 'Je me connecte' }).click();
    });

    await expect(page.getByRole('heading', { name: 'Campagnes' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Observatoire de Pix' })).toBeVisible();
  });
});
