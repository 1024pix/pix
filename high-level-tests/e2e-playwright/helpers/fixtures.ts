import path from 'node:path';

import { BrowserContext, test as base } from '@playwright/test';

import {
  AUTH_DIR,
  PIX_APP_USER_CREDENTIALS,
  PIX_CERTIF_PRO_CREDENTIALS,
  PIX_ORGA_PRO_CREDENTIALS,
  PIX_ORGA_SCO_ISMANAGING_CREDENTIALS,
  PIX_ORGA_SUP_ISMANAGING_CREDENTIALS,
} from './auth.js';
import { cleanDB } from './db.js';

export const test = base.extend<{
  forEachTest: void;
  testMode: string;
  pixAppUserContext: BrowserContext;
  pixOrgaProContext: BrowserContext;
  pixOrgaScoIsManagingContext: BrowserContext;
  pixOrgaSupIsManagingContext: BrowserContext;
  pixCertifProContext: BrowserContext;
}>({
  forEachTest: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await cleanDB();
      await use();
    },
    { auto: true },
  ],
  // eslint-disable-next-line no-empty-pattern
  testMode: async ({}, use) => {
    await use(process.env.TEST_MODE || 'check');
  },
  pixAppUserContext: async ({ browser }, use) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_APP_USER_CREDENTIALS.label}.json`);
    const context = await browser.newContext({ storageState: authFilePath });
    await use(context);
    await context.close();
  },
  pixOrgaProContext: async ({ browser }, use) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_PRO_CREDENTIALS.label}.json`);
    const context = await browser.newContext({ storageState: authFilePath });
    await use(context);
    await context.close();
  },
  pixOrgaScoIsManagingContext: async ({ browser }, use) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_SCO_ISMANAGING_CREDENTIALS.label}.json`);
    const context = await browser.newContext({ storageState: authFilePath });
    await use(context);
    await context.close();
  },
  pixOrgaSupIsManagingContext: async ({ browser }, use) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_SUP_ISMANAGING_CREDENTIALS.label}.json`);
    const context = await browser.newContext({ storageState: authFilePath });
    await use(context);
    await context.close();
  },
  pixCertifProContext: async ({ browser }, use) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_CERTIF_PRO_CREDENTIALS.label}.json`);
    const context = await browser.newContext({ storageState: authFilePath });
    await use(context);
    await context.close();
  },
});

export const expect = test.expect;
