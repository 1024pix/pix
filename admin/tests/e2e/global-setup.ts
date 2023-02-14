import { chromium, FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4202/'); // FIXME fetch from config.projects?
  await page.getByPlaceholder('Adresse e-mail').fill('superadmin@example.net');
  await page.getByPlaceholder('Mot de passe').fill('pix123');
  await page.getByRole('button', { name: 'Je me connecte' }).click();
  await page.waitForURL('http://localhost:4202/organizations/list')
  await page.context().storageState({ path: 'superadmin.storageState.json' });
  await browser.close();
}
