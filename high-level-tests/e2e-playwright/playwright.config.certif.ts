import path from 'node:path';

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

import sharedConfig from './playwright.config.shared.ts';

const isCI = Boolean(process.env.CI);
if (!isCI) dotenv.config({ path: path.resolve(import.meta.dirname, '.env.e2e') });

// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  ...sharedConfig,
  projects: [
    {
      name: 'recette certif - création utilisateur certifiable',
      testDir: 'tests/recette-certif',
      testMatch: '**/create-certifiable-user.ts',
    },
    {
      name: 'recette certif - passage de certif simple 100% réussite PRO coeur',
      testDir: 'tests/recette-certif',
      testMatch: '**/pro/**/*.ts',
      dependencies: ['recette certif - création utilisateur certifiable'],
    },
  ],
  webServer: [
    ...(sharedConfig.webServer as []),
    {
      cwd: '../../admin',
      command: `npx ember serve --proxy http://localhost:${process.env.PIX_API_PORT}`,
      url: process.env.PIX_ADMIN_URL,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        DEFAULT_LOCALE: 'fr',
      },
    },
  ],
});
