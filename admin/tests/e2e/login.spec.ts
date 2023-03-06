import { test, expect } from './test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  })

  test('s\'identifier puis se déconnecter', async ({ menuNavigation, page }) => {
    await expect(page).toHaveURL('/login');

    await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill('superadmin@example.net');
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('pix123');
    await page.getByRole('button', { name: 'Je me connecte' }).click();

    await expect(page).not.toHaveURL('/login');

    await menuNavigation.click('Se déconnecter');

    await expect(page).toHaveURL('/login');
  });
})
