import path from 'node:path';

import { Browser, type BrowserContext, Page } from '@playwright/test';

import { AUTH_DIR, Credentials, HAR_DIR, saveStorageState, shouldRecordHAR } from '../../helpers/auth.ts';
import { buildCandidate, buildPixAdminUser, buildPixCertifUser } from '../../helpers/certification/builders/index.ts';
import { pixCertifiableUserData } from '../../helpers/certification/data.ts';
import { PIX_ADMIN_CERTIF_DATA, PIX_CERTIF_PRO_DATA, PIX_CERTIF_SCO_DATA } from '../../helpers/certification/data.ts';
import { getCleaTargetProfileId } from '../../helpers/certification/db.ts';
import { PixAdminUserData, PixCertifiableUserData, PixCertifUserData } from '../../helpers/certification/types.ts';
import { knex } from '../../helpers/db.ts';
import { test as sharedTest } from '../index.ts';

const pixAppBrowserContextsPerUser = new Map<number, BrowserContext>();
const pixAppPages: Page[] = [];

export const loggedPagesFixtures = sharedTest.extend<
  // test scoped fixtures
  {
    pixAdminRoleCertifPage: Page;
    pixCertifProPage: Page;
    pixCertifScoPage: Page;
    pixCertifInvigilatorPage: Page;
    getCertifiableUserData: (firstName: string) => Promise<PixCertifiableUserData>;
  },
  // worker scoped fixtures (run max once per worker)
  {
    nextId: () => number;
    userDataMap: Map<object, object>;
    pixCertifProUserData: PixCertifUserData;
    pixCertifScoUserData: PixCertifUserData;
    pixAdminRoleCertifUserData: PixAdminUserData;
    pixAdminRoleCertifWorkerContext: BrowserContext;
    pixCertifProWorkerContext: BrowserContext;
    pixCertifScoWorkerContext: BrowserContext;
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
  getCertifiableUserData: async ({ userDataMap }, use) => {
    const getByFirstName = async (searchedFirstName: string) => {
      const userData = pixCertifiableUserData.find(({ firstName }) => firstName === searchedFirstName);
      return userDataMap.get(userData as PixCertifiableUserData) as PixCertifiableUserData;
    };
    await use(getByFirstName);
  },
  nextId: [
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
  ],
  userDataMap: [
    async ({ nextId }, use) => {
      const userDataMap = new Map();
      const cleaTargetProfileId = await getCleaTargetProfileId();
      // admin
      let id = nextId();
      let email = buildUniqueEmailFromId(id, PIX_ADMIN_CERTIF_DATA.email);
      let userData: unknown = {
        ...PIX_ADMIN_CERTIF_DATA,
        id,
        email,
      } as PixAdminUserData;
      await buildPixAdminUser(knex, userData as PixAdminUserData);
      userDataMap.set(PIX_ADMIN_CERTIF_DATA, userData);

      // pix certif pro
      id = nextId();
      email = buildUniqueEmailFromId(id, PIX_CERTIF_PRO_DATA.email);
      userData = {
        ...PIX_CERTIF_PRO_DATA,
        id,
        email,
      } as PixCertifUserData;
      await buildPixCertifUser(knex, userData as PixCertifUserData, cleaTargetProfileId);
      userDataMap.set(PIX_CERTIF_PRO_DATA, userData);

      // pix certif sco
      id = nextId();
      email = buildUniqueEmailFromId(id, PIX_CERTIF_SCO_DATA.email);
      userData = {
        ...PIX_CERTIF_SCO_DATA,
        id,
        email,
      } as PixCertifUserData;
      await buildPixCertifUser(knex, userData as PixCertifUserData, cleaTargetProfileId);
      userDataMap.set(PIX_CERTIF_SCO_DATA, userData);

      // certifiable users
      for (const certifiableUserData of pixCertifiableUserData) {
        id = nextId();
        email = buildUniqueEmailFromId(id, certifiableUserData.email);
        userData = {
          ...certifiableUserData,
          id,
          email,
        } as PixCertifiableUserData;
        await buildCandidate(knex, userData as PixCertifiableUserData);
        userDataMap.set(certifiableUserData, userData);
      }
      await use(userDataMap);
    },
    { scope: 'worker' },
  ],
  pixCertifProUserData: [
    async ({ userDataMap }, use) => {
      await use(userDataMap.get(PIX_CERTIF_PRO_DATA) as PixCertifUserData);
    },
    { scope: 'worker' },
  ],
  pixCertifScoUserData: [
    async ({ userDataMap }, use) => {
      await use(userDataMap.get(PIX_CERTIF_SCO_DATA) as PixCertifUserData);
    },
    { scope: 'worker' },
  ],
  pixAdminRoleCertifUserData: [
    async ({ userDataMap }, use) => {
      await use(userDataMap.get(PIX_ADMIN_CERTIF_DATA) as PixAdminUserData);
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

function buildUniqueEmailFromId(id: number, email: string) {
  const [username, domain] = email.split('@');
  return `${username}${id}@${domain}`;
}
