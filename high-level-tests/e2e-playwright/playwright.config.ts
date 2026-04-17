import { defineConfig } from '@playwright/test';

import sharedConfig, { App, isCI, reuseExistingApps, setupWebServer } from './playwright.config.shared.ts';

export default defineConfig({
  ...sharedConfig,
  projects: [
    {
      name: 'login',
      testDir: 'tests/login',
      testMatch: '**/*.ts',
    },
    {
      name: 'pix-app',
      testDir: 'tests/pix-app',
      testMatch: '**/*.ts',
    },
    {
      name: 'pix-orga',
      testDir: 'tests/pix-orga',
      testMatch: '**/*.ts',
    },
    {
      name: 'assessments',
      testDir: 'tests/assessments',
      testMatch: '**/*.ts',
    },
    {
      name: 'combined courses',
      testDir: 'tests/combined-courses',
      testMatch: '**/*.ts',
    },
  ],

  webServer: isCI
    ? [setupWebServer(App.PIX_APP, false), setupWebServer(App.PIX_ORGA, false), setupWebServer(App.PIX_CERTIF, false)]
    : [
        setupWebServer(App.PIX_API, false),
        setupWebServer(App.PIX_APP, reuseExistingApps),
        setupWebServer(App.PIX_ORGA, reuseExistingApps),
        setupWebServer(App.PIX_CERTIF, reuseExistingApps),
      ],
});
