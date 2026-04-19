import { defineConfig } from '@playwright/test';

import sharedConfig, { App, isCI, reuseExistingApps, setupWebServer } from './playwright.config.shared.ts';

export default defineConfig({
  ...sharedConfig,
  globalSetup: './global-setup',
  projects: [
    {
      name: 'recette prescription - setup base data for anonymization',
      testDir: 'tests/recette-prescription',
      testMatch: '**/create-organization-learner.spec.ts',
    },
    {
      name: 'recette prescription - anonymization scenarios',
      testDir: 'tests/recette-prescription',
      testMatch: '**/organization-learner-anonymisation/**/*.ts',
      dependencies: ['recette prescription - setup base data for anonymization'],
    },
  ],

  webServer: isCI
    ? [setupWebServer(App.PIX_APP, true), setupWebServer(App.PIX_ORGA, true), setupWebServer(App.PIX_ADMIN, true)]
    : [
        setupWebServer(App.PIX_API, false),
        setupWebServer(App.PIX_APP, reuseExistingApps),
        setupWebServer(App.PIX_ORGA, reuseExistingApps),
        setupWebServer(App.PIX_ADMIN, reuseExistingApps),
      ],
});
