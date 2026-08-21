import { baseCertifTest } from './base.ts';

export const snapshotRefsFixtures = baseCertifTest.extend<{
  testRef: string;
  snapshotPath: string;
  csvResultPath: string;
  certificateBasePath: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  testRef: async ({}, use, testInfo) => {
    await use(testInfo.title);
  },

  snapshotPath: async ({ testRef }, use) => {
    const pathStr = `recette-certif/${testRef}/snapshot.json`;
    await use(pathStr);
  },

  csvResultPath: async ({ testRef }, use) => {
    const pathStr = `recette-certif/${testRef}/csvresult.json`;
    await use(pathStr);
  },

  certificateBasePath: async ({ testRef }, use) => {
    const pathStr = `recette-certif/${testRef}/certificat`;
    await use(pathStr);
  },
});

export const expect = snapshotRefsFixtures.expect;
