// POC validation on the seeded target scenario, driven as a real user in a browser:
// a parent combined course made of three themed children plus a final assessment,
// delivering an attestation under a mastery condition.
// Needs an API running on a database built by `npm run db:reset` + `npm run cache:refresh`.
// Run with: npx playwright test --config playwright.config.seeded.ts
// Set SCREENSHOT_DIR to also capture a numbered screenshot of every step.
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures/index.ts';
import { LoginPage } from '../../pages/pix-app/LoginPage.ts';

const PARENT = { code: 'IAPARCOUR', name: "Culture de l'IA" };
const CHILDREN = [
  { code: 'IADECOUV', name: "L'IA, comment ça marche ?", hasModule: true },
  { code: 'IADROIT', name: "IA et droit d'auteur", hasModule: true },
  // only two demo modules can be walked through without answering activities,
  // so this child is a diagnosis on its own
  { code: 'IAENVIRO', name: 'IA et impact environnemental', hasModule: false },
];
const COMPLETED_HEADING = 'Félicitations ! Vous avez terminé !';

const screenshotDir = process.env.SCREENSHOT_DIR;

test.setTimeout(900_000);

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

async function enterNextItem(page: Page) {
  return clickIfVisible(page, /^(Commencer|Continuer) mon parcours$/, 10_000);
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
    // leaving the didacticiel is a route transition: without waiting for it the
    // loop below reads a stale page and gives up before the first challenge
    await page.waitForURL((url) => !url.pathname.includes('didacticiel'), { timeout: 30_000 });
  } catch {
    // already dismissed by a previous campaign
  }

  // skip every challenge until the results link shows up
  const results = page.getByRole('link', { name: 'Voir mes résultats' }).first();
  for (let i = 0; i < 20; i++) {
    if (await results.isVisible().catch(() => false)) break;
    const skip = page.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }).first();
    try {
      await skip.waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      break;
    }
    if (!(await skip.isEnabled().catch(() => false))) {
      await clickIfVisible(page, /épreuve|le sujet|Je commence/i, 3000);
      await expect(skip).toBeEnabled({ timeout: 30_000 });
    }
    await skip.click();
    await page.waitForTimeout(1500);
  }

  await results.waitFor({ state: 'visible', timeout: 30_000 });
  await results.click();

  await page.waitForURL(/resultats|\/parcours\//, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await shot(page, `${label}-campagne-resultats`);
  await clickContinue(page);
  await page.waitForTimeout(3000);
}

async function runModule(page: Page, label: string) {
  // the module details page needs a moment before its start button is there
  await page.waitForTimeout(4000);
  await shot(page, `${label}-module-presentation`);
  await page.getByRole('button', { name: 'Commencer le module' }).click();
  for (let i = 0; i < 40; i++) {
    if (await clickIfVisible(page, 'Terminer', 3000)) break;
    if (!(await clickIfVisible(page, /^(Continuer|Suivant|Vérifier)$/, 3000))) break;
  }
  await shot(page, `${label}-module-termine`);
  await clickContinue(page, 30_000);
  await page.waitForTimeout(4000);
}

test('a user walks the seeded parent combined course to the attestation', async ({ page }) => {
  const uid = randomUUID().slice(-8);
  if (screenshotDir) await fs.mkdir(screenshotDir, { recursive: true });

  page.on('pageerror', (error) => log('[pageerror]', String(error).slice(0, 300)));
  page.on('console', (message) => {
    if (message.type() === 'error') log('[console]', message.text().slice(0, 300));
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      log('[http]', response.status(), response.request().method(), response.url().slice(0, 160));
    }
  });

  await test.step('Sign up as a brand new user and open the parent course', async () => {
    await page.goto(process.env.PIX_APP_URL as string);
    await new LoginPage(page).signup('Poc', 'Tester', `poc.tester.${uid}@example.net`, 'Coucoulesdevs66');
    await page.goto(`${process.env.PIX_APP_URL}/parcours/${PARENT.code}`);
    await expect(page.getByRole('heading', { name: PARENT.name, level: 1 })).toBeVisible();
    log('[parent]', await body(page));
    await shot(page, 'parent-non-demarre');
  });

  await test.step('The parent lists its three children and the final assessment', async () => {
    for (const child of CHILDREN) {
      await expect(page.getByText(child.name)).toBeVisible();
    }
    await expect(page.getByText("Bilan : culture de l'IA")).toBeVisible();
    // only the first item is reachable
    await expect(page.getByRole('link').filter({ hasText: CHILDREN[0].name })).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: CHILDREN[1].name })).toHaveCount(0);
  });

  for (const [index, child] of CHILDREN.entries()) {
    await test.step(`Complete child ${index + 1} — ${child.name}`, async () => {
      await enterNextItem(page);
      await expect(page.getByRole('heading', { name: child.name, level: 1 })).toBeVisible();
      await shot(page, `enfant-${index + 1}-non-demarre`);

      await enterNextItem(page);
      await runCampaign(page, `enfant-${index + 1}`);
      await expect(page.getByRole('heading', { name: child.name, level: 1 })).toBeVisible();
      await shot(page, `enfant-${index + 1}-campagne-completee`);

      if (child.hasModule) {
        await enterNextItem(page);
        await runModule(page, `enfant-${index + 1}`);
      }

      await expect(page.getByRole('heading', { name: child.name, level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: COMPLETED_HEADING })).toBeVisible();
      await shot(page, `enfant-${index + 1}-termine`);

      await clickContinue(page);
      await expect(page.getByRole('heading', { name: PARENT.name, level: 1 })).toBeVisible();
      // step titles are derived from the items, so they must not drift across renders
      await expect(page.getByRole('heading', { name: 'Étape 1' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Étape 2' })).toBeVisible();
      log(`[parent after child ${index + 1}]`, await body(page));
      await shot(page, `parent-apres-enfant-${index + 1}`);
    });
  }

  await test.step('The final assessment is now reachable', async () => {
    await expect(page.getByRole('link').filter({ hasText: "Bilan : culture de l'IA" })).toBeVisible();
    await enterNextItem(page);
    await runCampaign(page, 'bilan');
  });

  await test.step('The parent course is completed and settles the attestation', async () => {
    await expect(page.getByRole('heading', { name: PARENT.name, level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: COMPLETED_HEADING })).toBeVisible();
    // no parent above this one, so no way to continue any further
    await expect(page.getByRole('link', { name: 'Continuer', exact: true })).toHaveCount(0);
    log('[parent completed]', await body(page));
    await shot(page, 'parent-termine-attestation');
  });
});
