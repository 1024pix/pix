import { randomUUID } from 'node:crypto';

import { expect, test } from '../../fixtures/index.ts';
import { getLastPixOrgaInvitation } from '../../helpers/db.ts';
import { PixOrgaPage } from '../../pages/pix-orga/index.ts';

let email: string;

test.beforeEach(async () => {
  const uid = randomUUID().slice(-3);
  email = `bernard.peur-${uid}@pix.fr`;
});

test('Managing Team', async ({ pixOrgaAdminContext, page }) => {
  test.slow();

  await test.step('Invite a new user to PRO organization', async () => {
    const pixOrgaPage = await pixOrgaAdminContext.newPage();
    await pixOrgaPage.goto(process.env.PIX_ORGA_URL as string);
    await pixOrgaPage.getByRole('button', { name: "Changer d'organisation" }).click();
    await pixOrgaPage.getByRole('option', { name: 'Orga pro (PRO)' }).click();
    await pixOrgaPage.getByRole('link', { name: 'Équipe' }).click();
    await pixOrgaPage.getByRole('link', { name: 'Inviter un membre' }).click();
    await pixOrgaPage.getByRole('textbox', { name: 'Adresse(s) e-mail *' }).fill(email);
    await pixOrgaPage.getByRole('button', { name: 'Inviter' }).click();
    await pixOrgaPage.getByRole('button', { name: 'Valider' }).click();
    await expect(pixOrgaPage.getByText('Une invitation a bien été envoyée')).toBeVisible();
  });

  await test.step('User join PRO organization (no account)', async () => {
    const { invitationId, code } = await getLastPixOrgaInvitation();
    const pixOrgaPage = new PixOrgaPage(page);
    await pixOrgaPage.acceptInvitation(invitationId, code);
    await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();
    await page.getByRole('link', { name: "S'inscrire sur Pix" }).click();
    await page.getByRole('textbox', { name: 'Prénom' }).fill('Bernard');
    await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('Peur');
    await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(email);
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('Pix12345');
    await page.getByRole('checkbox', { name: "J'accepte les conditions d'" }).check();
    await page.getByRole('button', { name: "Je m'inscris" }).click();
    await page.getByRole('button', { name: 'Accepter et continuer' }).click();
    await expect(page.getByRole('heading', { name: 'Bonjour Bernard,' })).toBeVisible();
    await page.getByRole('link', { name: 'Se déconnecter' }).click();
  });

  await test.step('Invite a new user to SUP organization', async () => {
    const pixOrgaPage = await pixOrgaAdminContext.newPage();
    await pixOrgaPage.goto(process.env.PIX_ORGA_URL as string);
    await pixOrgaPage.getByRole('button', { name: "Changer d'organisation" }).click();
    await pixOrgaPage.getByRole('option', { name: 'Orga sup (SUP_MANAGING)' }).click();
    await pixOrgaPage.getByRole('link', { name: 'Équipe' }).click();
    await pixOrgaPage.getByRole('link', { name: 'Inviter un membre' }).click();
    await pixOrgaPage.getByRole('textbox', { name: 'Adresse(s) e-mail *' }).fill(email);
    await pixOrgaPage.getByRole('button', { name: 'Inviter' }).click();
    await pixOrgaPage.getByRole('button', { name: 'Valider' }).click();
    await expect(pixOrgaPage.getByText('Une invitation a bien été envoyée')).toBeVisible();
  });

  await test.step('User join SUP organization (existing account)', async () => {
    const { invitationId, code } = await getLastPixOrgaInvitation();
    const pixOrgaPage = new PixOrgaPage(page);
    await pixOrgaPage.acceptInvitation(invitationId, code);
    await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();
    await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(email);
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('Pix12345');
    await page.getByRole('button', { name: 'Je me connecte' }).click();
    await expect(page.getByRole('heading', { name: 'Bonjour Bernard,' })).toBeVisible();
    await expect(page.getByText('Orga sup (SUP_MANAGING)')).toBeVisible();
  });

  await test.step('Invite a new user to SCO organization', async () => {
    const pixOrgaPage = await pixOrgaAdminContext.newPage();
    await pixOrgaPage.goto(process.env.PIX_ORGA_URL as string);
    await pixOrgaPage.getByRole('button', { name: "Changer d'organisation" }).click();
    await pixOrgaPage.getByRole('option', { name: 'Orga sco (SCO_MANAGING)' }).click();
    await pixOrgaPage.getByRole('link', { name: 'Équipe' }).click();
    await pixOrgaPage.getByRole('link', { name: 'Inviter un membre' }).click();
    await pixOrgaPage.getByRole('textbox', { name: 'Adresse(s) e-mail *' }).fill(email);
    await pixOrgaPage.getByRole('button', { name: 'Inviter' }).click();
    await pixOrgaPage.getByRole('button', { name: 'Valider' }).click();
    await expect(pixOrgaPage.getByText('Une invitation a bien été envoyée')).toBeVisible();
  });

  await test.step('Already connected user following an invitation is disconnected', async () => {
    const { invitationId, code } = await getLastPixOrgaInvitation();
    const pixOrgaPage = new PixOrgaPage(page);
    await pixOrgaPage.acceptInvitation(invitationId, code);
    await expect(page.getByText('Vous êtes invité(e) à')).toBeVisible();
    await page.goto(process.env.PIX_ORGA_URL as string);
    await expect(page.getByText('Connectez-vous')).toBeVisible();
  });
});
