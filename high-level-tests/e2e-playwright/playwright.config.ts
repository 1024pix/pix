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
});
