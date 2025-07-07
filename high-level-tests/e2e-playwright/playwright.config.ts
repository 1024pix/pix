import path from 'node:path';

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

const playwrightFolder = './node_modules/.playwright';

const isCI = Boolean(process.env.CI);
if (!isCI) dotenv.config({ path: path.resolve(import.meta.dirname, '.env.e2e') });

// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  globalSetup: './global-setup',
  outputDir: `${playwrightFolder}/output`,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  fullyParallel: false,
  reporter: isCI ? [['junit', { outputFile: `${playwrightFolder}/junit/results.xml` }]] : 'list',

  use: {
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    screenshot: isCI ? 'only-on-failure' : 'off',
  },

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
      name: 'evaluations',
      testDir: 'tests/evaluations',
      testMatch: '**/*.ts',
    },
  ],
  webServer: isCI
    ? [
        {
          command: 'while true; do echo "Wait for App to start"; sleep 300; done',
          url: process.env.PIX_APP_URL || process.env.PIX_ORGA_URL || process.env.PIX_CERTIF_URL,
          reuseExistingServer: true,
        },
      ]
    : [
        {
          cwd: '../../api',
          command: 'npm run db:prepare && npm run cache:refresh && npm run start',
          url: `http://localhost:${process.env.PIX_API_PORT}`,
          reuseExistingServer: false,
          stdout: 'ignore',
          stderr: 'pipe',
          env: {
            PORT: process.env.PIX_API_PORT ?? '',
            DATABASE_URL: process.env.DATABASE_URL ?? '',
            DATAMART_DATABASE_URL: process.env.DATAMART_DATABASE_URL ?? '',
            DATAWAREHOUSE_DATABASE_URL: process.env.DATAWAREHOUSE_DATABASE_URL ?? '',
            REDIS_URL: process.env.REDIS_URL ?? '',
            START_JOB_IN_WEB_PROCESS: 'false',
            PIX_AUDIT_LOGGER_ENABLED: 'false',
            MAILING_ENABLED: 'false',
            LCMS_API_URL: process.env.LCMS_API_URL ?? '',
            LCMS_API_KEY: process.env.LCMS_API_KEY ?? '',
            LCMS_API_RELEASE_ID: process.env.LCMS_API_RELEASE_ID ?? '',
            V3_CERTIFICATION_PROBABILITY_TO_PICK_CHALLENGE: '100',
          },
        },
        {
          cwd: '../../mon-pix',
          command: `npx ember serve --proxy http://localhost:${process.env.PIX_API_PORT}`,
          url: process.env.PIX_APP_URL,
          reuseExistingServer: false,
          stdout: 'ignore',
          stderr: 'pipe',
          env: {
            DEFAULT_LOCALE: 'fr',
          },
        },
        {
          cwd: '../../orga',
          command: `npx ember serve --proxy http://localhost:${process.env.PIX_API_PORT}`,
          url: process.env.PIX_ORGA_URL,
          reuseExistingServer: false,
          stdout: 'ignore',
          stderr: 'pipe',
          env: {
            DEFAULT_LOCALE: 'fr',
          },
        },
        {
          cwd: '../../certif',
          command: `npx ember serve --proxy http://localhost:${process.env.PIX_API_PORT}`,
          url: process.env.PIX_CERTIF_URL,
          reuseExistingServer: false,
          stdout: 'ignore',
          stderr: 'pipe',
          env: {
            DEFAULT_LOCALE: 'fr',
          },
        },
      ],
});
