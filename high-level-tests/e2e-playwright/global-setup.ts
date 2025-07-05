import { Browser, chromium, Page } from '@playwright/test';
import * as fs from 'fs/promises';

import {
  Credentials,
  PIX_APP_USER_CREDENTIALS,
  PIX_CERTIF_PRO_CREDENTIALS,
  PIX_ORGA_PRO_CREDENTIALS,
  PIX_ORGA_SCO_ISMANAGING_CREDENTIALS,
  PIX_ORGA_SUP_ISMANAGING_CREDENTIALS,
} from './helpers/auth';
import { buildAuthenticatedUsers } from './helpers/db';

type LoginFunction = (page: Page, creds: Credentials) => Promise<void>;

async function pixAppLogin(page: Page, creds: Credentials) {
  await page.goto(process.env.PIX_APP_URL + '/connexion');
  await page.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }).fill(creds.email);
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill(creds.rawPassword);
  await page.getByRole('button', { name: 'Je me connecte' }).click();
  await page.waitForFunction(() => document.title === 'Accueil | Pix', { timeout: 5_000 });
  const title = await page.title();
  if (title !== 'Accueil | Pix') {
    throw new Error(`PixApp login failed for user ${creds.id}: unexpected title "${title}"`);
  }
}

async function pixOrgaLogin(page: Page, creds: Credentials) {
  await page.goto(process.env.PIX_ORGA_URL + '/connexion');
  await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(creds.email);
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill(creds.rawPassword);
  await page.getByRole('button', { name: 'Je me connecte' }).click();
  await page.waitForURL((url) => url.toString().endsWith('campagnes/les-miennes'), { timeout: 5_000 });
  const url = page.url();
  if (!url.endsWith('campagnes/les-miennes')) {
    throw new Error(`PixOrga login failed for user ${creds.id}: unexpected url "${url.toString()}"`);
  }
}

async function pixCertifLogin(page: Page, creds: Credentials) {
  await page.goto(process.env.PIX_CERTIF_URL + '/connexion');
  await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(creds.email);
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill(creds.rawPassword);
  await page.getByRole('button', { name: 'Je me connecte' }).click();
  await page.waitForURL(process.env.PIX_CERTIF_URL + '/sessions', { timeout: 5_000 });
  const url = page.url();
  if (url !== process.env.PIX_CERTIF_URL + '/sessions') {
    throw new Error(`PixCertif login failed for user ${creds.id}: unexpected url "${url.toString()}"`);
  }
}

async function loginAndSaveStorageState(browser: Browser, creds: Credentials, loginFn: LoginFunction) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await loginFn(page, creds);

    await fs.mkdir('.auth', { recursive: true });
    const filePath = `.auth/${creds.appAndRole}.json`;
    await context.storageState({ path: filePath });

    await context.close();
    console.log(`✅ User auth state for ${creds.appAndRole} saved to ${filePath}`);
  } catch (err) {
    await page.screenshot({ path: 'global-setup-login-failure.png' });
    throw err;
  }
}

export default async function globalSetup() {
  try {
    const browser = await chromium.launch();
    await buildAuthenticatedUsers({ withCguAccepted: true });

    await loginAndSaveStorageState(browser, PIX_APP_USER_CREDENTIALS, pixAppLogin);
    await loginAndSaveStorageState(browser, PIX_ORGA_PRO_CREDENTIALS, pixOrgaLogin);
    await loginAndSaveStorageState(browser, PIX_ORGA_SCO_ISMANAGING_CREDENTIALS, pixOrgaLogin);
    await loginAndSaveStorageState(browser, PIX_ORGA_SUP_ISMANAGING_CREDENTIALS, pixOrgaLogin);
    await loginAndSaveStorageState(browser, PIX_CERTIF_PRO_CREDENTIALS, pixCertifLogin);

    await browser.close();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}
