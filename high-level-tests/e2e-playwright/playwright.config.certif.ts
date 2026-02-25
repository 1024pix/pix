import { defineConfig } from '@playwright/test';

import sharedConfig, { App, isCI, reuseExistingApps, setupWebServer } from './playwright.config.shared.ts';

export default defineConfig({
  ...sharedConfig,
  timeout: 70_000,
  projects: [
    {
      name: 'Recette',
      testDir: 'tests/recette-certif',
      testMatch: '**/*.spec.ts',
    },
  ],

  webServer: isCI
    ? [
        setupWebServer(App.PIX_APP, true),
        setupWebServer(App.PIX_ORGA, true),
        setupWebServer(App.PIX_CERTIF, true),
        setupWebServer(App.PIX_ADMIN, true),
      ]
    : [
        setupWebServer(App.PIX_API, false),
        setupWebServer(App.PIX_APP, reuseExistingApps),
        setupWebServer(App.PIX_ORGA, reuseExistingApps),
        setupWebServer(App.PIX_CERTIF, reuseExistingApps),
        setupWebServer(App.PIX_ADMIN, reuseExistingApps),
      ],
});
