import { test, expect } from './test';

test.describe('Centres de certification', () => {
  test.use({ storageState: 'superadmin.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('créer un centre de certification', async ({ menuNavigation, page }) => {
    await menuNavigation.click('Centres de certification');

    // Création du centre
    await page.getByRole('link', { name: 'Nouveau centre de certif' }).click();
    await page.getByRole('textbox', { name: 'Nom du centre' }).fill('L\'école des fans');
    await page.getByRole('button', { name: 'Sélectionner un type d\'établissement' }).click();
    await page.getByRole('option', { name: 'Établissement scolaire' }).click();
    await page.getByRole('textbox', { name: 'Identifiant externe' }).fill('1234');
    await page.getByRole('textbox', { name: 'Prénom du DPO' }).fill('Jacques');
    await page.getByRole('textbox', { name: 'Nom du DPO', exact: true }).fill('Martin');
    await page.getByRole('textbox', { name: 'Adresse e-mail du DPO' }).fill('jacques.martin@ecoledesfans.fr');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect.soft(page.getByText('Le centre de certification a été créé avec succès.')).toBeVisible();
    await expect(page.getByRole('heading', { name: "L'école des fans" })).toBeVisible();
    await expect.soft(page.getByText('Type : Établissement scolaire')).toBeVisible();
    await expect.soft(page.getByText('Identifiant externe : 1234')).toBeVisible();
    await expect.soft(page.getByText('Nom du DPO : Jacques Martin')).toBeVisible();
    await expect.soft(page.getByText('Adresse e-mail du DPO : jacques.martin@ecoledesfans.fr')).toBeVisible();

    // Ajout d'un membre
    await expect.soft(page.getByRole('heading', { name: 'Ajouter un membre' })).toBeVisible()

    await page.getByRole('textbox', { name: 'Adresse e-mail du nouveau membre' }).fill('superadmin@example.net');
    await page.getByRole('button', { name: 'Ajouter le membre' }).click();

    await expect.soft(page.getByText('Membre ajouté avec succès.')).toBeVisible();
    await expect.soft(page.getByRole('heading', { name: 'Membres' })).toBeVisible();
    const memberRow = page.getByRole('row', { name: "Informations du membre Super Admin" });
    await expect(memberRow).toBeVisible();
    await expect.soft(memberRow.getByRole('cell', { name: 'Super', exact: true })).toBeVisible();
    await expect.soft(memberRow.getByRole('cell', { name: 'Admin', exact: true })).toBeVisible();
    await expect.soft(memberRow.getByRole('cell', { name: 'superadmin@example.net' })).toBeVisible();

    // Envoi d'une invitation
    await page.getByRole('link', { name: 'Invitations' }).click();

    await expect(page.getByRole('heading', { name: 'Inviter un membre' })).toBeVisible()

    await page.getByRole('textbox', { name: 'Adresse e-mail du membre à inviter' }).fill('michel.delpech@example.net');
    await page.getByRole('button', { name: 'Inviter un membre' }).click();

    await expect.soft(page.getByText('Un email a bien a été envoyé à l\'adresse michel.delpech@example.net.')).toBeVisible();
    await expect.soft(page.getByRole('heading', { name: 'Invitations' })).toBeVisible();
    const invitationRow = page.getByRole('row', { name: 'Invitation en attente de michel.delpech@example.net' });
    await expect(invitationRow).toBeVisible()
    await expect.soft(invitationRow.getByRole('cell', { name: 'michel.delpech@example.net', exact: true })).toBeVisible()
  });
});

