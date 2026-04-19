import path from 'node:path';

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

const playwrightFolder = './node_modules/.playwright';

export const isCI = Boolean(process.env.CI);
if (!isCI) dotenv.config({ path: path.resolve(import.meta.dirname, '.env.e2e') });
export const reuseExistingApps = process.env.REUSE_EXISTING_APPS === 'true';

// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  outputDir: `${playwrightFolder}/output`,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  fullyParallel: true,
  reporter: isCI ? [['junit', { outputFile: `${playwrightFolder}/junit/results.xml` }]] : 'list',

  use: {
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    screenshot: isCI ? 'only-on-failure' : 'off',
  },
});

export enum App {
  PIX_API,
  PIX_APP,
  PIX_ORGA,
  PIX_ADMIN,
  PIX_CERTIF,
}

type WebServerConfig = {
  command: string;
  url: string;
  reuseExistingServer?: boolean;
  cwd?: string;
  timeout?: number;
  stdout?: 'pipe' | 'ignore';
  stderr?: 'pipe' | 'ignore';
  env?: Record<string, string>;
};

export function setupWebServer(app: App, reuseExistingServer: boolean): WebServerConfig {
  if (app === App.PIX_API) {
    if (reuseExistingServer) {
      throw new Error('Unhandled');
    } else {
      return {
        cwd: '../../api',
        command: 'npm run db:prepare && npm run cache:refresh && npm run start',
        url: `http://localhost:${process.env.PIX_API_PORT}`,
        reuseExistingServer: false,
        timeout: 180 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
        env: {
          PORT: process.env.PIX_API_PORT ?? '',
          DATABASE_URL: process.env.DATABASE_URL ?? '',
          DATAMART_DATABASE_URL: process.env.DATAMART_DATABASE_URL ?? '',
          DATAWAREHOUSE_DATABASE_URL: process.env.DATAWAREHOUSE_DATABASE_URL ?? '',
          REDIS_URL: process.env.REDIS_URL ?? '',
          START_JOB_IN_WEB_PROCESS: 'true',
          MAILING_ENABLED: 'false',
          LCMS_API_URL: process.env.LCMS_API_URL ?? '',
          LCMS_API_KEY: process.env.LCMS_API_KEY ?? '',
          LCMS_API_RELEASE_ID: process.env.LCMS_API_RELEASE_ID ?? '',
        },
      };
    }
  }

  const appConfig = {
    [App.PIX_APP]: {
      url: process.env.PIX_APP_URL!,
      cwd: '../../mon-pix',
      label: 'PixApp',
    },
    [App.PIX_ORGA]: {
      url: process.env.PIX_ORGA_URL!,
      cwd: '../../orga',
      label: 'PixOrga',
    },
    [App.PIX_ADMIN]: {
      url: process.env.PIX_ADMIN_URL!,
      cwd: '../../admin',
      label: 'PixAdmin',
    },
    [App.PIX_CERTIF]: {
      url: process.env.PIX_CERTIF_URL!,
      cwd: '../../certif',
      label: 'PixCertif',
    },
  };
  if (reuseExistingServer) {
    return {
      command: `while true; do echo "Wait for ${appConfig[app].label} to start"; sleep 300; done`,
      url: appConfig[app].url,
      reuseExistingServer: true,
    };
  } else {
    return {
      cwd: appConfig[app].cwd,
      timeout: 180 * 1000,
      command: `npx ember serve --proxy http://localhost:${process.env.PIX_API_PORT}`,
      url: appConfig[app].url,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        DEFAULT_LOCALE: 'fr',
      },
    };
  }
}
