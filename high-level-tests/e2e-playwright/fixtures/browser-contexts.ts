import path from 'node:path';

import type { BrowserContext } from '@playwright/test';
import { test as base } from '@playwright/test';

import {
  AUTH_DIR,
  PIX_ADMIN_SUPPORT_CREDENTIALS,
  PIX_APP_USER_CREDENTIALS,
  PIX_CERTIF_PRO_CREDENTIALS,
  PIX_ORGA_ADMIN_CREDENTIALS,
  PIX_ORGA_MEMBER_CREDENTIALS,
} from '../helpers/auth.js';

const shouldRecordHAR = process.env.RECORD_HAR === 'true';
const HAR_DIR = path.resolve(import.meta.dirname, '../.har-record');

export const browserContextsFixtures = base.extend<{
  globalTestId: string;
  forEachTest: void;
  pixAppUserContext: BrowserContext;
  pixOrgaAdminContext: BrowserContext;
  pixOrgaMemberContext: BrowserContext;
  pixCertifProContext: BrowserContext;
  pixSuperAdminContext: BrowserContext;
  pixAdminSupportContext: BrowserContext;
}>({
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
  pixOrgaAdminContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_ADMIN_CREDENTIALS.label}.json`);
    const harFilePath = path.join(
      HAR_DIR,
      `${sanitizeFilename(testInfo.title)}-${PIX_ORGA_ADMIN_CREDENTIALS.label}.har`,
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
  pixOrgaMemberContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ORGA_MEMBER_CREDENTIALS.label}.json`);
    const harFilePath = path.join(
      HAR_DIR,
      `${sanitizeFilename(testInfo.title)}-${PIX_ORGA_MEMBER_CREDENTIALS.label}.har`,
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
  pixAdminSupportContext: async ({ browser }, use, testInfo) => {
    const authFilePath = path.join(AUTH_DIR, `${PIX_ADMIN_SUPPORT_CREDENTIALS.label}.json`);
    const harFilePath = path.join(
      HAR_DIR,
      `${sanitizeFilename(testInfo.title)}-${PIX_ADMIN_SUPPORT_CREDENTIALS.label}.har`,
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
