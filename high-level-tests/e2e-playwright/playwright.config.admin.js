import { defineConfig } from '@playwright/test';

/**
 * Config Playwright pour les tests fonctionnels de pix-admin.
 * Suppose que le stack de dev tourne déjà (API sur :3000, admin sur :4202).
 *
 * Lancement :
 *   cd high-level-tests/e2e-playwright
 *   npx playwright test --config playwright.config.admin.js
 *
 * Variables d'environnement :
 *   PIX_ADMIN_URL  - URL de l'admin (défaut: http://localhost:4202)
 *   ADMIN_EMAIL    - email superadmin (défaut: superadmin@example.net)
 *   ADMIN_PASSWORD - mot de passe (défaut: pix123)
 */
export default defineConfig({
  testDir: './tests/pix-admin',
  testMatch: '**/*.test.js',

  // Les appels LLM peuvent prendre jusqu'à 2 minutes
  timeout: 120_000,
  expect: { timeout: 90_000 },

  retries: 1,
  workers: 1,
  fullyParallel: false,

  reporter: [['list'], ['html', { outputFolder: '.playwright/report-admin', open: 'never' }]],

  use: {
    baseURL: process.env.PIX_ADMIN_URL ?? 'http://localhost:4202',
    locale: 'fr-FR',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30_000,
  },
});
