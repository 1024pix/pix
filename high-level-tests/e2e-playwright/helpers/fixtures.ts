import path from 'node:path';

import { BrowserContext, test as base } from '@playwright/test';
import crypto from 'crypto';
import * as fs from 'fs/promises';

import {
  AUTH_DIR,
  PIX_APP_USER_CREDENTIALS,
  PIX_CERTIF_PRO_CREDENTIALS,
  PIX_ORGA_ADMIN_CREDENTIALS,
  PIX_ORGA_MEMBER_CREDENTIALS,
} from './auth.js';

const shouldRecordHAR = process.env.RECORD_HAR === 'true';
const HAR_DIR = path.resolve(import.meta.dirname, '../.har-record');

export const test = base.extend<{
  globalTestId: string;
  forEachTest: void;
  pixAppUserContext: BrowserContext;
  pixOrgaAdminContext: BrowserContext;
  pixOrgaMemberContext: BrowserContext;
  pixCertifProContext: BrowserContext;
  snapshotHandler: SnapshotHandler;
}>({
  globalTestId: async (_, use, testInfo) => {
    const raw = `${testInfo.file}::${testInfo.title}`;
    const hash = crypto.createHash('sha1').update(raw).digest('hex');
    await use(hash);
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
  snapshotHandler: async (_, use) => {
    await use(new SnapshotHandler({ shouldUpdateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' }));
  },
});

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9_\-.]/gi, '_');
}

export const expect = test.expect;

class SnapshotHandler {
  private readonly results: { label: string; value: number | string }[];
  private readonly shouldUpdateSnapshots: boolean;
  constructor({ shouldUpdateSnapshots }: { shouldUpdateSnapshots: boolean }) {
    this.results = [];
    this.shouldUpdateSnapshots = shouldUpdateSnapshots;
  }

  push(label: string, value: number | string) {
    this.results.push({ label, value });
  }

  async expectOrRecord(fileName: string) {
    const resultDir = path.resolve(import.meta.dirname, '../snapshots');
    const resultFilePath = path.join(resultDir, fileName as string);
    if (this.shouldUpdateSnapshots) {
      await fs.writeFile(resultFilePath, JSON.stringify(this.results));
    } else {
      const data = await fs.readFile(resultFilePath, { encoding: 'utf-8' });
      const expectedResults = JSON.parse(data);
      test.expect(this.results.length).toBe(expectedResults.length);
      for (let i = 0; i < this.results.length; ++i) {
        test.expect(this.results[i]).toStrictEqual(expectedResults[i]);
      }
    }
  }
}
