import path from 'node:path';

import { Browser, type BrowserContext, Page } from '@playwright/test';

import { AUTH_DIR, Credentials, HAR_DIR, saveStorageState, shouldRecordHAR } from '../../helpers/auth.ts';
import { pixCertifiableUserData } from '../../helpers/certification/data.ts';
import { PixAdminUserData, PixCertifiableUserData, PixCertifUserData } from '../../helpers/certification/types.ts';
import { knex } from '../../helpers/db.ts';
import { PIX_ADMIN_CERTIF_DATA, PIX_CERTIF_PRO_DATA, PIX_CERTIF_SCO_DATA } from '../../helpers/db-data.ts';
import { test as sharedTest } from '../index.ts';

const pixAppBrowserContextsPerUser = new Map<number, BrowserContext>();
const pixAppPages: Page[] = [];

export const loggedPagesFixtures = sharedTest.extend<
  {
    pixAdminRoleCertifPage: Page;
    pixCertifProPage: Page;
    pixCertifScoPage: Page;
    pixCertifInvigilatorPage: Page;
    pixOrgaProPage: Page;
    getCertifiableUserData: (i: number) => Promise<PixCertifiableUserData>;
  },
  {
    certifiableUserDatas: PixCertifiableUserData[];
    pixCertifProUserData: PixCertifUserData;
    pixCertifScoUserData: PixCertifUserData;
    pixAdminRoleCertifUserData: PixAdminUserData;
    pixAdminRoleCertifWorkerContext: BrowserContext;
    pixCertifProWorkerContext: BrowserContext;
    pixCertifScoWorkerContext: BrowserContext;
    pixOrgaProWorkerContext: BrowserContext;
    pixAppCertifiableUserContext: (p: PixCertifiableUserData) => Promise<BrowserContext>;
    pixAppCertifiableUserPage: (p: PixCertifiableUserData) => Promise<Page>;
  }
>({
  pixAdminRoleCertifPage: async ({ pixAdminRoleCertifWorkerContext }, use) => {
    const page = await pixAdminRoleCertifWorkerContext.newPage();
    await page.goto(process.env.PIX_ADMIN_URL!);
    await use(page);
    await page.close();
  },
  pixOrgaProPage: async ({ pixOrgaProWorkerContext }, use) => {
    const page = await pixOrgaProWorkerContext.newPage();
    await page.goto(process.env.PIX_ORGA_URL!);
    await use(page);
    await page.close();
  },
  pixCertifProPage: async ({ pixCertifProWorkerContext }, use) => {
    const page = await pixCertifProWorkerContext.newPage();
    await page.goto(process.env.PIX_CERTIF_URL!);
    await use(page);
    await page.close();
  },
  pixCertifScoPage: async ({ pixCertifScoWorkerContext }, use) => {
    const page = await pixCertifScoWorkerContext.newPage();
    await page.goto(process.env.PIX_CERTIF_URL!);
    await use(page);
    await page.close();
  },
  pixCertifInvigilatorPage: async ({ pixCertifProWorkerContext }, use) => {
    const page = await pixCertifProWorkerContext.newPage();
    await page.goto(process.env.PIX_CERTIF_URL + '/connexion-espace-surveillant');
    await use(page);
    await page.close();
  },
  // eslint-disable-next-line no-empty-pattern
  getCertifiableUserData: async ({}, use) => {
    const getByIndex = async (index: number) => {
      const users = await knex('users').whereILike('email', 'pix-app-user-%').orderBy('id');
      return {
        ...users[index],
        ...pixCertifiableUserData[index],
      };
    };
    await use(getByIndex);
  },
  /*nextId: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const shardOffset = (workerInfo.config.shard?.current ?? 0) * 100;
      const workerOffset = workerInfo.workerIndex + 1;
      const globalOffset = (shardOffset + workerOffset) * 1_000;

      function* idGenerator() {
        let counter = 0;
        while (true) {
          yield globalOffset + counter++;
        }
      }

      const generatorInstance = idGenerator();
      const nextId: () => number = () => generatorInstance.next().value!;

      await use(nextId);
    },
    { scope: 'worker' },
  ],*/
  pixCertifProUserData: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(PIX_CERTIF_PRO_DATA);
    },
    { scope: 'worker' },
  ],
  pixCertifScoUserData: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(PIX_CERTIF_SCO_DATA);
    },
    { scope: 'worker' },
  ],
  pixAdminRoleCertifUserData: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(PIX_ADMIN_CERTIF_DATA as PixAdminUserData);
    },
    { scope: 'worker' },
  ],
  pixAdminRoleCertifWorkerContext: [
    async ({ browser, pixAdminRoleCertifUserData }, use) => {
      const credentials = {
        id: pixAdminRoleCertifUserData.id,
        label: `pix-admin-role-certif-${pixAdminRoleCertifUserData.id}`,
        firstName: pixAdminRoleCertifUserData.firstName,
        lastName: pixAdminRoleCertifUserData.lastName,
        email: pixAdminRoleCertifUserData.email,
        rawPassword: pixAdminRoleCertifUserData.rawPassword,
        appUrl: process.env.PIX_ADMIN_URL!,
      };
      const context = await setupContext(browser, credentials);
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  pixCertifProWorkerContext: [
    async ({ browser, pixCertifProUserData }, use) => {
      const credentials = {
        id: pixCertifProUserData.id,
        label: `pix-certif-pro-${pixCertifProUserData.id}`,
        firstName: pixCertifProUserData.firstName,
        lastName: pixCertifProUserData.lastName,
        email: pixCertifProUserData.email,
        rawPassword: pixCertifProUserData.rawPassword,
        appUrl: process.env.PIX_CERTIF_URL!,
      };
      const context = await setupContext(browser, credentials);
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  pixCertifScoWorkerContext: [
    async ({ browser, pixCertifScoUserData }, use) => {
      const credentials = {
        id: pixCertifScoUserData.id,
        label: `pix-certif-sco-${pixCertifScoUserData.id}`,
        firstName: pixCertifScoUserData.firstName,
        lastName: pixCertifScoUserData.lastName,
        email: pixCertifScoUserData.email,
        rawPassword: pixCertifScoUserData.rawPassword,
        appUrl: process.env.PIX_CERTIF_URL!,
      };
      const context = await setupContext(browser, credentials);
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  pixOrgaProWorkerContext: [
    async ({ browser, pixCertifProUserData }, use) => {
      const credentials = {
        id: pixCertifProUserData.id,
        label: `pix-orga-pro-${pixCertifProUserData.id}`,
        firstName: pixCertifProUserData.firstName,
        lastName: pixCertifProUserData.lastName,
        email: pixCertifProUserData.email,
        rawPassword: pixCertifProUserData.rawPassword,
        appUrl: process.env.PIX_ORGA_URL!,
      };
      const context = await setupContext(browser, credentials);
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  pixAppCertifiableUserContext: [
    async ({ browser }, use) => {
      const createContextForUser = async (certifiableUserData: PixCertifiableUserData) => {
        if (pixAppBrowserContextsPerUser.has(certifiableUserData.id)) {
          return pixAppBrowserContextsPerUser.get(certifiableUserData.id)!;
        }
        const credentials = {
          id: certifiableUserData.id,
          label: `pix-app-certifiable-${certifiableUserData.id}`,
          firstName: certifiableUserData.firstName,
          lastName: certifiableUserData.lastName,
          email: certifiableUserData.email,
          rawPassword: certifiableUserData.rawPassword,
          appUrl: process.env.PIX_APP_URL!,
        };
        const context = await setupContext(browser, credentials);
        pixAppBrowserContextsPerUser.set(certifiableUserData.id, context);
        return context;
      };
      await use(createContextForUser);
      for (const browser of pixAppBrowserContextsPerUser.values()) {
        await browser.close();
      }
    },
    { scope: 'worker' },
  ],
  pixAppCertifiableUserPage: [
    async ({ pixAppCertifiableUserContext }, use) => {
      const createPageForUser = async (certifiableUserData: PixCertifiableUserData) => {
        const browser = await pixAppCertifiableUserContext(certifiableUserData);
        const page = await browser.newPage();
        pixAppPages.push(page);
        await page.route('**/api/**', (route) => {
          route.continue({
            headers: {
              ...route.request().headers(),
              origin: 'https://app.e2e.pix.fr',
            },
          });
        });
        await page.goto(process.env.PIX_APP_URL!);
        return page;
      };
      await use(createPageForUser);
      for (const page of pixAppPages) {
        await page.close();
      }
    },
    { scope: 'worker' },
  ],
});

async function setupContext(browser: Browser, credentials: Credentials) {
  await saveStorageState(credentials);

  const authFilePath = path.join(AUTH_DIR, `${credentials.label}.json`);
  const harFilePath = path.join(HAR_DIR, `${credentials.label}.har`);
  const recordHar = shouldRecordHAR
    ? {
        path: harFilePath,
        content: 'omit' as const,
      }
    : undefined;
  return browser.newContext({
    storageState: authFilePath,
    recordHar,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
}
