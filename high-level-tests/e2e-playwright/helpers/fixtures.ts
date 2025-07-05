import { BrowserContext, test as base } from '@playwright/test';

import {
  PIX_APP_USER_CREDENTIALS,
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
    const context = await browser.newContext({ storageState: `.auth/${PIX_APP_USER_CREDENTIALS.appAndRole}.json` });
    await use(context);
    await context.close();
  },
  pixOrgaProContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: `.auth/${PIX_ORGA_PRO_CREDENTIALS.appAndRole}.json`,
    });
    await use(context);
    await context.close();
  },
  pixOrgaScoIsManagingContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: `.auth/${PIX_ORGA_SCO_ISMANAGING_CREDENTIALS.appAndRole}.json`,
    });
    await use(context);
    await context.close();
  },
  pixOrgaSupIsManagingContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: `.auth/${PIX_ORGA_SUP_ISMANAGING_CREDENTIALS.appAndRole}.json`,
    });
    await use(context);
    await context.close();
  },
});

export const expect = test.expect;
