// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('https://app.dev.pix.fr/connexion');

  await page.getByText('Se connecter avec pôle emploi').click();
  await page.getByRole('button', { name: 'Tout accepter' }).click();
  await page.getByRole('textbox', { name: "Nom d'utilisateur" }).fill('cecile62');
  await page.getByRole('button', { name: 'Poursuivre' }).click();
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill('8YxtL7@rG');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  const cguCheckbox = page.getByRole('checkbox');
  //await cguCheckbox.check({ trial: true });
  if (await cguCheckbox.isVisible()) {
    await cguCheckbox.click();
    await page.getByRole('button', { name: 'Je crée mon compte' }).click();
  }

  await page.getByRole('button', { name: 'COLINE' }).click();
  await page.getByRole('link', { name: 'Se déconnecter' }).click();

  await expect(page).toHaveURL('https://www-r.pe-qvr.fr/accueil/');
});
