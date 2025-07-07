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
const shouldRecordHAR = process.env.RECORD_HAR === 'true';
const HAR_DIR = path.resolve(import.meta.dirname, '../.har-record');

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
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
  context: async ({ browser }, use, testInfo) => {
    const harFilePath = path.join(HAR_DIR, `${sanitizeFilename(testInfo.title)}-defaultContext.har`);
    const context = await browser.newContext(
      shouldRecordHAR
        ? {
            recordHar: {
              path: harFilePath,
              content: 'omit',
            },
          }
        : {},
    );
    await use(context);
    await context.close();
  },
  pixAppUserContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_APP_USER_CREDENTIALS.label}.json`);
    const harFilePath = path.join(HAR_DIR, `${sanitizeFilename(testInfo.title)}-${PIX_APP_USER_CREDENTIALS.label}.har`);
    const recordHar = shouldRecordHAR
      ? {
          path: harFilePath,
          content: 'omit' as const,
        }
      : undefined;
    const context = await browser.newContext({ storageState: authFilePath, recordHar });
    await use(context);
    await context.close();
  },
  pixOrgaProContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_PRO_CREDENTIALS.label}.json`);
    const harFilePath = path.join(HAR_DIR, `${sanitizeFilename(testInfo.title)}-${PIX_ORGA_PRO_CREDENTIALS.label}.har`);
    const recordHar = shouldRecordHAR
      ? {
          path: harFilePath,
          content: 'omit' as const,
        }
      : undefined;
    const context = await browser.newContext({ storageState: authFilePath, recordHar });
    await use(context);
    await context.close();
  },
  pixOrgaScoIsManagingContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_SCO_ISMANAGING_CREDENTIALS.label}.json`);
    const harFilePath = path.join(
      HAR_DIR,
      `${sanitizeFilename(testInfo.title)}-${PIX_ORGA_SCO_ISMANAGING_CREDENTIALS.label}.har`,
    );
    const recordHar = shouldRecordHAR
      ? {
          path: harFilePath,
          content: 'omit' as const,
        }
      : undefined;
    const context = await browser.newContext({ storageState: authFilePath, recordHar });
    await use(context);
    await context.close();
  },
  pixOrgaSupIsManagingContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_SUP_ISMANAGING_CREDENTIALS.label}.json`);
    const harFilePath = path.join(
      HAR_DIR,
      `${sanitizeFilename(testInfo.title)}-${PIX_ORGA_SUP_ISMANAGING_CREDENTIALS.label}.har`,
    );
    const recordHar = shouldRecordHAR
      ? {
          path: harFilePath,
          content: 'omit' as const,
        }
      : undefined;
    const context = await browser.newContext({ storageState: authFilePath, recordHar });
    await use(context);
    await context.close();
  },
  pixCertifProContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_CERTIF_PRO_CREDENTIALS.label}.json`);
    const harFilePath = path.join(
      HAR_DIR,
      `${sanitizeFilename(testInfo.title)}-${PIX_CERTIF_PRO_CREDENTIALS.label}.har`,
    );
    const recordHar = shouldRecordHAR
      ? {
          path: harFilePath,
          content: 'omit' as const,
        }
      : undefined;
    const context = await browser.newContext({ storageState: authFilePath, recordHar });
    await use(context);
    await context.close();
  },
});

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9_\-.]/gi, '_');
}

export const expect = test.expect;
