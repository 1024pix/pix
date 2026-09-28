import { defineConfig } from '@playwright/test';

import sharedConfig, { App, reuseExistingApps, setupWebServer } from './playwright.config.shared.ts';

// POC-scoped config: only boots the API and PixApp, since the nested combined course
// scenario never leaves PixApp. Throwaway alongside the POC itself.
// Server output is piped so a boot failure is visible instead of silent.
const withVisibleOutput = (webServer: ReturnType<typeof setupWebServer>) => ({
  ...webServer,
  stdout: 'pipe' as const,
  stderr: 'pipe' as const,
});

// Unlike the shared helper, reuse is also supported for the API here: it makes the
// dev loop bearable when both servers are already up locally.
const waitForExistingServer = (url: string) => ({
  command: `while true; do echo "Waiting for ${url}"; sleep 300; done`,
  url,
  reuseExistingServer: true,
});

export default defineConfig({
  ...sharedConfig,
  globalSetup: './global-setup',
  // fail fast on a missing element instead of hanging until the test timeout,
  // and keep an artefact to look at
  use: { ...sharedConfig.use, actionTimeout: 20_000, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'poc-nested-combined-course',
      testDir: 'tests/pix-app',
      testMatch: 'nested-combined-course.test.ts',
    },
  ],

  webServer: reuseExistingApps
    ? [
        waitForExistingServer(`http://localhost:${process.env.PIX_API_PORT}`),
        waitForExistingServer(process.env.PIX_APP_URL as string),
      ]
    : [withVisibleOutput(setupWebServer(App.PIX_API, false)), withVisibleOutput(setupWebServer(App.PIX_APP, false))],
});
