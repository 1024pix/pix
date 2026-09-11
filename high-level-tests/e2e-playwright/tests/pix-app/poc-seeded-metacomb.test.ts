// POC validation on the seeded data (METACOMB), driven as a real user in a browser.
// Needs an API running on a database built by `npm run db:reset` + `npm run cache:refresh`.
// Run with: npx playwright test --config playwright.config.seeded.ts
// Set SCREENSHOT_DIR to also capture a numbered screenshot of every step.
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures/index.ts';
import { LoginPage } from '../../pages/pix-app/LoginPage.ts';

const PARENT = { code: 'METACOMB', name: 'POC parcours de parcours' };
const FIRST_CHILD = { code: 'CBNOMOD', name: 'Parcours sans modules' };
const SECOND_CHILD = { code: 'COMBINIX1', name: 'Parcours apprenant complet' };
const COMPLETED_HEADING = 'Félicitations ! Vous avez terminé !';

const screenshotDir = process.env.SCREENSHOT_DIR;

test.setTimeout(600_000);

const log = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(...args);
};

let shotIndex = 0;

async function shot(page: Page, label: string) {
  if (!screenshotDir) return;
  shotIndex += 1;
  const name = `${String(shotIndex).padStart(2, '0')}-${label}.png`;
  await page.screenshot({ path: path.join(screenshotDir, name), fullPage: true });
  log(`[screenshot] ${name}`);
}

async function body(page: Page) {
  return (await page.locator('body').innerText()).replace(/\n+/g, ' | ').slice(0, 500);
}

async function clickIfVisible(page: Page, name: string | RegExp, timeout = 4000) {
  const button = page.getByRole('button', { name });
  try {
    await button.first().waitFor({ state: 'visible', timeout });
  } catch {
    return false;
  }
  await button.first().click();
  return true;
}

// "Continuer" is a link when the target is an absolute URL, and a button when the
// campaign's customResultPageButtonUrl is relative, as the seeds have it.
async function clickContinue(page: Page, timeout = 120_000) {
  const candidate = page
    .getByRole('link', { name: 'Continuer', exact: true })
    .or(page.getByRole('button', { name: 'Continuer', exact: true }))
    .first();
  await candidate.waitFor({ state: 'visible', timeout });
  await candidate.click();
}

async function runCampaign(page: Page, label: string) {
  await shot(page, `${label}-campagne-presentation`);
  await page.getByRole('button', { name: 'Je commence' }).click();

  // the didacticiel only shows up for the very first campaign of a user
  const tutorial = page.getByRole('button', { name: 'Ignorer' }).first();
  try {
    await tutorial.waitFor({ state: 'visible', timeout: 8000 });
    await shot(page, `${label}-campagne-didacticiel`);
    await tutorial.click();
  } catch {
    // already dismissed by a previous campaign
  }

  // skip every challenge until the results link shows up
  const results = page.getByRole('link', { name: 'Voir mes résultats' }).first();
  for (let i = 0; i < 20; i++) {
    if (await results.isVisible().catch(() => false)) break;
    const skip = page.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }).first();
    if (!(await skip.isVisible().catch(() => false))) break;
    if (!(await skip.isEnabled().catch(() => false))) {
      await clickIfVisible(page, /épreuve|le sujet|Je commence/i, 3000);
      await expect(skip).toBeEnabled({ timeout: 30_000 });
    }
    await shot(page, `${label}-campagne-epreuve-${i + 1}`);
    await skip.click();
    await page.waitForTimeout(1500);
  }

  await results.waitFor({ state: 'visible', timeout: 30_000 });
  await shot(page, `${label}-campagne-fin-evaluation`);
  await results.click();

  // the results page goes through a loading redirect before it renders
  await page.waitForURL(/resultats|\/parcours\//, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  log(`[${label} results]`, page.url(), await body(page));
  await shot(page, `${label}-campagne-resultats`);

  await clickContinue(page);
}

async function runModules(page: Page, label: string) {
  for (let module = 0; module < 5; module++) {
    // enter the next item from the combined course page, like a user resuming it
    if (!(await clickIfVisible(page, /^(Commencer|Continuer) mon parcours$/, 6000))) return;
    await page.waitForTimeout(3000);
    await shot(page, `${label}-module-${module + 1}-presentation`);
    if (!(await clickIfVisible(page, 'Commencer le module', 15_000))) return;
    for (let i = 0; i < 30; i++) {
      if (await clickIfVisible(page, 'Terminer', 3000)) break;
      if (!(await clickIfVisible(page, /^(Continuer|Suivant|Vérifier)$/, 3000))) break;
    }
    log(`[${label} module ${module} done]`, page.url(), await body(page));
    await shot(page, `${label}-module-${module + 1}-termine`);
    await clickContinue(page, 30_000);
    await page.waitForTimeout(4000);
  }
}

test('a user walks the seeded meta combined course to the end', async ({ page }) => {
  const uid = randomUUID().slice(-8);
  if (screenshotDir) await fs.mkdir(screenshotDir, { recursive: true });

  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      log('[http]', response.status(), response.request().method(), response.url());
    }
  });

  await test.step('Sign up as a brand new user', async () => {
    await page.goto(process.env.PIX_APP_URL as string);
    await new LoginPage(page).signup('Poc', 'Tester', `poc.tester.${uid}@example.net`, 'Coucoulesdevs66');
    await shot(page, 'inscription-utilisateur-neuf');
  });

  await test.step('Open the meta combined course', async () => {
    await page.goto(`${process.env.PIX_APP_URL}/parcours/${PARENT.code}`);
    await expect(page.getByRole('heading', { name: PARENT.name })).toBeVisible();
    await expect(page.getByText(FIRST_CHILD.name)).toBeVisible();
    await expect(page.getByText(SECOND_CHILD.name)).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: SECOND_CHILD.name })).toHaveCount(0);
    log('[parent]', page.url(), await body(page));
    await shot(page, 'meta-parcours-non-demarre');
  });

  await test.step('Start it, which enters the first child', async () => {
    await page.getByRole('button', { name: 'Commencer mon parcours' }).click();
    await expect(page.getByRole('heading', { name: FIRST_CHILD.name })).toBeVisible();
    await shot(page, 'premier-enfant-non-demarre');
  });

  await test.step('Complete the first child', async () => {
    await page.getByRole('button', { name: 'Commencer mon parcours' }).click();
    await runCampaign(page, 'premier-enfant');
    await expect(page.getByRole('heading', { name: FIRST_CHILD.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: COMPLETED_HEADING })).toBeVisible();
    await shot(page, 'premier-enfant-termine-bouton-continuer');
  });

  await test.step('Continue back to the parent, the second child is unlocked', async () => {
    await clickContinue(page);
    await expect(page.getByRole('heading', { name: PARENT.name })).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: SECOND_CHILD.name })).toBeVisible();
    log('[parent after first child]', await body(page));
    await shot(page, 'meta-parcours-premier-enfant-complete');
  });

  await test.step('Resume the parent, which enters the second child', async () => {
    await page.getByRole('button', { name: 'Continuer mon parcours' }).click();
    await expect(page.getByRole('heading', { name: SECOND_CHILD.name })).toBeVisible();
    await shot(page, 'second-enfant-non-demarre');
  });

  await test.step('Complete the second child, campaign then modules', async () => {
    await page.getByRole('button', { name: 'Commencer mon parcours' }).click();
    await runCampaign(page, 'second-enfant');
    await page.waitForTimeout(5000);
    log('[second child after campaign]', page.url(), await body(page));

    // this child recommends modules, so its campaign lands on the loading page first
    if (page.url().includes('/chargement')) {
      await shot(page, 'second-enfant-chargement-recommandations');
      await clickContinue(page, 60_000);
      await page.waitForTimeout(3000);
      log('[second child after loading page]', page.url(), await body(page));
    }

    await expect(page.getByRole('heading', { name: SECOND_CHILD.name })).toBeVisible();
    await shot(page, 'second-enfant-campagne-completee-module-deverrouille');
    await runModules(page, 'second-enfant');
    await expect(page.getByRole('heading', { name: SECOND_CHILD.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: COMPLETED_HEADING })).toBeVisible();
    await shot(page, 'second-enfant-termine-bouton-continuer');
  });

  await test.step('The meta combined course is completed', async () => {
    await clickContinue(page);
    await expect(page.getByRole('heading', { name: PARENT.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: COMPLETED_HEADING })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continuer' })).toHaveCount(0);
    log('[parent completed]', await body(page));
    await shot(page, 'meta-parcours-termine');
  });
});
