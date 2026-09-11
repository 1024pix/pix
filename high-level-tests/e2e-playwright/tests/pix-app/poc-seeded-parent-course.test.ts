// POC validation on the seeded target scenario, driven as a real user in a browser.
// The whole parcours is now walked FROM THE PARENT PAGE: a nested course is a group in
// the parent's list, never a destination. The user answers correctly, so the run ends
// with the attestation obtained.
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
const CHILDREN = ["L'IA, comment ça marche ?", "IA et droit d'auteur", 'IA et impact environnemental'];
const FINAL_ASSESSMENT = "Bilan : culture de l'IA";
const COMPLETED_HEADING = 'Félicitations ! Vous avez terminé !';
const ATTESTATION_OBTAINED = 'Vous avez obtenu votre attestation !';

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
  return (await page.locator('body').innerText()).replace(/\n+/g, ' | ').slice(0, 400);
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
  return clickIfVisible(page, /^(Commencer|Continuer) mon parcours$/, 15_000);
}

// Every challenge of this content release is a QCU whose right answer is the first
// proposal, so answering correctly is picking the first radio. Mastery then reaches the
// 50 % the parent's attestation requires.
async function runCampaign(page: Page, label: string) {
  await shot(page, `${label}-campagne`);
  await page.getByRole('button', { name: 'Je commence' }).click();

  const tutorial = page.getByRole('button', { name: 'Ignorer' }).first();
  try {
    await tutorial.waitFor({ state: 'visible', timeout: 8000 });
    await tutorial.click();
    await page.waitForURL((url) => !url.pathname.includes('didacticiel'), { timeout: 30_000 });
  } catch {
    // already dismissed by a previous campaign
  }

  const results = page.getByRole('link', { name: 'Voir mes résultats' }).first();
  for (let i = 0; i < 20; i++) {
    if (await results.isVisible().catch(() => false)) break;

    const firstProposal = page.getByRole('radio').first();
    try {
      await firstProposal.waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      break;
    }
    await firstProposal.check();

    const validate = page.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }).first();
    await expect(validate).toBeEnabled({ timeout: 20_000 });
    await validate.click();
    await page.waitForTimeout(1500);
  }

  await results.waitFor({ state: 'visible', timeout: 30_000 });
  await results.click();
  await page.waitForURL(/resultats|\/parcours\//, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await shot(page, `${label}-resultats`);

  await clickContinue(page);
  await page.waitForTimeout(4000);
}

async function runModule(page: Page, label: string) {
  // the module details page needs a moment before its start button is there
  await page.waitForTimeout(4000);
  await shot(page, `${label}-module`);
  await page.getByRole('button', { name: 'Commencer le module' }).click();
  for (let i = 0; i < 40; i++) {
    if (await clickIfVisible(page, 'Terminer', 3000)) break;
    if (!(await clickIfVisible(page, /^(Continuer|Suivant|Vérifier)$/, 3000))) break;
  }
  await clickContinue(page, 30_000);
  await page.waitForTimeout(4000);
}

test('a user walks the seeded parent combined course and obtains the attestation', async ({ page }) => {
  const uid = randomUUID().slice(-8);
  if (screenshotDir) await fs.mkdir(screenshotDir, { recursive: true });

  page.on('pageerror', (error) => log('[pageerror]', String(error).slice(0, 200)));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      log('[http]', response.status(), response.request().method(), response.url().slice(0, 140));
    }
  });

  const parentHeading = page.getByRole('heading', { name: PARENT.name, level: 1 });
  const completedHeading = page.getByRole('heading', { name: COMPLETED_HEADING });

  await test.step('Sign up as a brand new user and open the parent course', async () => {
    await page.goto(process.env.PIX_APP_URL as string);
    await new LoginPage(page).signup('Poc', 'Tester', `poc.tester.${uid}@example.net`, 'Coucoulesdevs66');
    await page.goto(`${process.env.PIX_APP_URL}/parcours/${PARENT.code}`);
    await expect(parentHeading).toBeVisible();
    log('[parent]', await body(page));
    await shot(page, 'parent-non-demarre');
  });

  await test.step('The parent lists its nested courses and the activities of the current one', async () => {
    for (const child of CHILDREN) {
      await expect(page.getByText(child)).toBeVisible();
    }
    await expect(page.getByText(FINAL_ASSESSMENT)).toBeVisible();
    // the point of the target model: the child's own activity shows up on the parent page
    await expect(page.getByText('Évaluation de vos connaissances').first()).toBeVisible();
  });

  await test.step('Walk every activity from the parent page', async () => {
    for (let step = 0; step < 12; step++) {
      if (await completedHeading.isVisible().catch(() => false)) break;

      expect(await enterNextItem(page)).toBe(true);
      await page.waitForTimeout(2500);

      const url = page.url();
      if (url.includes('/campagnes/')) {
        await runCampaign(page, `etape-${step + 1}`);
      } else if (url.includes('/modules/')) {
        await runModule(page, `etape-${step + 1}`);
      } else {
        throw new Error(`Unexpected destination for step ${step + 1}: ${url}`);
      }

      // every activity brings the learner back to the parent, never to a child page
      await expect(parentHeading).toBeVisible();
      expect(page.url()).toContain(`/parcours/${PARENT.code}`);
      log(`[parent after step ${step + 1}]`, await body(page));
      await shot(page, `parent-apres-etape-${step + 1}`);
    }
  });

  await test.step('The parcours is completed and the attestation is obtained', async () => {
    await expect(completedHeading).toBeVisible();
    await expect(page.getByText(ATTESTATION_OBTAINED)).toBeVisible();
    log('[parent completed]', await body(page));
    await shot(page, 'parent-termine-attestation-obtenue');
  });
});
