import { defineConfig } from '@playwright/test';

import sharedConfig from './playwright.config.shared.ts';

// POC config for the walkthrough on the seeded data: no globalSetup (the data comes from
// `npm run db:reset`), no webServer, it drives whatever API and PixApp are already running.
export default defineConfig({
  ...sharedConfig,
  use: { ...sharedConfig.use, actionTimeout: 30_000, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'poc-seeded-metacomb',
      testDir: 'tests/pix-app',
      testMatch: 'poc-seeded-metacomb.test.ts',
    },
  ],
});
