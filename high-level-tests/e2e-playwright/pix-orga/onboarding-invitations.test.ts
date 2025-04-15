import { expect } from '@playwright/test';

import { useLoggedUser } from '../helpers/auth.js';
import { databaseBuilder } from '../helpers/db.js';
import { test } from '../helpers/fixtures.js';

test('A new user joins a new organization from an invitation link', async function ({ page }) {
  const invitation = databaseBuilder.factory.buildOrganizationInvitation();
  await databaseBuilder.commit();

  await page.goto(`/rejoindre?invitationId=${invitation.id}&code=${invitation.code}`);
  await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();

  await test.step('signup user', async () => {
    await page.getByRole('textbox', { name: 'Prénom' }).fill('mini');
    await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('pixou');
    await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill('minipixou@example.net');
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('Azerty123*');
    await page.getByRole('checkbox', { name: "Accepter les conditions d'utilisation de Pix" }).check();
    await page.getByRole('button', { name: "Je m'inscris" }).click();
  });

  await page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation" }).waitFor();
  await page.getByRole('button', { name: 'Accepter et continuer' }).click();

  await expect(page.getByRole('heading', { name: 'Campagnes' })).toBeVisible();
});

test('An existing user joins a new organization from an invitation link', async function ({ page }) {
  const invitation = databaseBuilder.factory.buildOrganizationInvitation();
  const user = databaseBuilder.factory.buildUser.withRawPassword();
  await databaseBuilder.commit();

  await page.goto(`/rejoindre?invitationId=${invitation.id}&code=${invitation.code}`);
  await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();

  await test.step('signin user', async () => {
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(user.email);
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('pix123');
    await page.getByRole('button', { name: 'Je me connecte' }).click();
  });

  await page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation" }).waitFor();
  await page.getByRole('button', { name: 'Accepter et continuer' }).click();

  await expect(page.getByRole('heading', { name: 'Campagnes' })).toBeVisible();
});

test.describe('When user is already authenticated to Pix Orga', () => {
  const userId = useLoggedUser('pix-orga');

  test('Joins a new organization from an invitation link', async function ({ page }) {
    const invitation = databaseBuilder.factory.buildOrganizationInvitation();
    const user = databaseBuilder.factory.buildUser.withMembership({ id: userId });
    await databaseBuilder.commit();

    await page.goto(`/rejoindre?invitationId=${invitation.id}&code=${invitation.code}`);
    await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();

    await test.step('signin user', async () => {
      await page.getByRole('button', { name: 'Se connecter' }).click();
      await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(user.email);
      await page.getByRole('textbox', { name: 'Mot de passe' }).fill('pix123');
      await page.getByRole('button', { name: 'Je me connecte' }).click();
    });

    await page.getByRole('heading', { name: "Veuillez accepter nos Conditions Générales d'Utilisation" }).waitFor();
    await page.getByRole('button', { name: 'Accepter et continuer' }).click();

    await expect(page.getByRole('heading', { name: 'Campagnes' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Observatoire de Pix' })).toBeVisible();
  });
});
