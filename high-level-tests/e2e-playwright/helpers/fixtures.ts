import { test as base } from '@playwright/test';

import { cleanDB } from './db.js';

export const test = base.extend<{
  forEachTest: void;
  testMode: string;
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
});
