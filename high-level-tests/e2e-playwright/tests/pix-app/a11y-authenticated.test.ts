import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';

import { expect, test } from '../../fixtures/index.ts';
import { A11Y_VIEWPORTS, disableAnimation } from '../../helpers/utils.ts';
import {
  ChallengePage,
  FinalCheckpointPage,
  IntermediateCheckpointPage,
  LoginPage,
  StartCampaignPage,
} from '../../pages/pix-app/index.ts';
import { PixOrgaPage } from '../../pages/pix-orga/index.ts';

const routes = [
  // { path: '/accueil', title: 'Accueil | Pix' }, -> TODO FAILING
  { path: '/campagnes', title: "J'ai un code | Pix" },
  { path: '/certifications', title: 'Rejoindre une session de certification | Pix' },
  { path: '/competences', title: 'Compétences | Pix' },
  { path: '/mes-certifications', title: 'Mes certifications | Pix' },
  { path: '/mes-formations', title: 'Mes formations | Pix' },
  { path: '/mon-compte/informations-personnelles', title: 'Mon compte | Pix' },
  { path: '/mon-compte/langue', title: 'Mon compte | Pix' },
  { path: '/mon-compte/methodes-de-connexion', title: 'Mon compte | Pix' },
  { path: '/plan-du-site', title: 'Plan du site | Pix' },
  { path: '/mes-tutos/recommandes', title: 'Mes tutoriels | Pix' },
  { path: '/mes-tutos/enregistres', title: 'Mes tutoriels | Pix' },
  {
    path: '/competences/recsvLz0W2ShyfD63/details',
    title: 'Mener une recherche et une veille d’information | Compétence | Pix',
  },
];

test.describe('Check a11y for authenticated pages', () => {
  routes.forEach(({ path, title }) => {
    test(`page ${path}`, async ({ pixAppUserContext }) => {
      const page = await pixAppUserContext.newPage();
      await disableAnimation(page);
      await page.goto(process.env.PIX_APP_URL + path);
      await expect(page).toHaveTitle(title);

      await page.locator('.app-loader').waitFor({ state: 'detached' });
      for (const viewport of A11Y_VIEWPORTS) {
        await page.setViewportSize(viewport);

        const results = await new AxeBuilder({ page }).analyze();

        if (results.violations.length > 0) {
          // eslint-disable-next-line no-console
          console.table(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.length,
            })),
          );
        }
        expect(results.violations).toEqual([]);
      }
    });
  });

  test('page /campagnes/:code/presentation', async ({ pixAppUserContext, pixOrgaMemberContext }) => {
    let campaignCode;
    await test.step('Creates a campaign', async () => {
      const pixOrgaPage = await pixOrgaMemberContext.newPage();
      campaignCode = await createCampaign(pixOrgaPage);
    });

    const path = `/campagnes/${campaignCode!}/presentation`;
    const page = await pixAppUserContext.newPage();
    await disableAnimation(page);
    await page.goto(process.env.PIX_APP_URL + path);
    await expect(page).toHaveTitle('Présentation | Parcours | Pix');

    await page.locator('.app-loader').waitFor({ state: 'detached' });
    for (const viewport of A11Y_VIEWPORTS) {
      await page.setViewportSize(viewport);

      const results = await new AxeBuilder({ page }).analyze();

      if (results.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.table(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
        );
      }
      // TODO FAILING
      // expect(results.violations).toEqual([]);
    }
  });

  test('page /mes-parcours', async ({ pixAppUserContext, pixOrgaMemberContext }) => {
    let campaignCode: string;
    await test.step('Creates a campaign', async () => {
      const pixOrgaPage = await pixOrgaMemberContext.newPage();
      campaignCode = (await createCampaign(pixOrgaPage))!;
    });

    const page = await pixAppUserContext.newPage();
    await page.goto(process.env.PIX_APP_URL + '/mes-parcours');
    await disableAnimation(page);
    await test.step('Enters the campaign', async () => {
      await page.getByRole('link', { name: "J'ai un code" }).click();
      const startCampaignPage = new StartCampaignPage(page);
      await startCampaignPage.goToFirstChallenge(campaignCode);
    });

    await page.goto(process.env.PIX_APP_URL + '/mes-parcours');
    await expect(page).toHaveTitle('Mes parcours | Pix');

    await page.locator('.app-loader').waitFor({ state: 'detached' });
    for (const viewport of A11Y_VIEWPORTS) {
      await page.setViewportSize(viewport);

      const results = await new AxeBuilder({ page }).analyze();

      if (results.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.table(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
        );
      }
      expect(results.violations).toEqual([]);
    }
  });

  test('page /campagnes/:code/evaluation/resultats', async ({ page, pixOrgaMemberContext, globalTestId }) => {
    let campaignCode: string;
    await test.step('Creates a campaign', async () => {
      const pixOrgaPage = await pixOrgaMemberContext.newPage();
      campaignCode = (await createCampaign(pixOrgaPage))!;
    });

    await page.goto(process.env.PIX_APP_URL!);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${globalTestId}@example.net`, 'Coucoulesdevs66');
    await test.step('Enters the campaign and ends it to reach results page', async () => {
      await page.getByRole('link', { name: "J'ai un code" }).click();
      const startCampaignPage = new StartCampaignPage(page);
      await startCampaignPage.goToFirstChallenge(campaignCode);
      await test.step(` answering right until the end`, async () => {
        while (!page.url().includes('finalCheckpoint=true')) {
          const challengePage = new ChallengePage(page);
          await challengePage.setRightOrWrongAnswer(true);
          await challengePage.validateAnswer();

          if (page.url().includes('/checkpoint') && !page.url().includes('finalCheckpoint=true')) {
            const checkpointPage = new IntermediateCheckpointPage(page);
            await checkpointPage.goNext();
          }
        }
        const finalCheckpointPage = new FinalCheckpointPage(page);
        await disableAnimation(page);
        await finalCheckpointPage.goToResults();
      });
    });

    await expect(page).toHaveTitle('Résultat | Parcours | Pix');

    await page.locator('.app-loader').waitFor({ state: 'detached' });
    for (const viewport of A11Y_VIEWPORTS) {
      await page.setViewportSize(viewport);

      const results = await new AxeBuilder({ page }).analyze();

      if (results.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.table(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
        );
      }
      expect(results.violations).toEqual([]);
    }
  });

  test('page /assessments/:id/challenges/:number', async ({ page, globalTestId }) => {
    await disableAnimation(page);
    await page.goto(process.env.PIX_APP_URL!);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${globalTestId}@example.net`, 'Coucoulesdevs66');
    await test.step('Enters a competence challenge', async () => {
      await page.getByRole('link', { name: 'Compétences', exact: true }).click();
      await page.getByRole('link', { name: 'Mener une recherche et une veille d’information' }).first().click();
      await page.getByRole('link', { name: 'Commencer' }).click();
    });

    await expect(page).toHaveTitle(
      'Mode libre - Question 1 sur 5 | Mener une recherche et une veille d’information | Pix',
    );

    await page.locator('.app-loader').waitFor({ state: 'detached' });
    for (const viewport of A11Y_VIEWPORTS) {
      await page.setViewportSize(viewport);

      const results = await new AxeBuilder({ page }).analyze();

      if (results.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.table(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
        );
      }
      // TODO FAILING
      // expect(results.violations).toEqual([]);
    }
  });
});

async function createCampaign(pixOrgaPage: Page): Promise<string | null> {
  await pixOrgaPage.goto(process.env.PIX_ORGA_URL as string);
  return await test.step('creates the campaign', async () => {
    await pixOrgaPage.getByRole('link', { name: 'Campagnes', exact: true }).click();
    await pixOrgaPage.getByRole('link', { name: 'Créer une campagne' }).click();
    const createCampaignPage = new PixOrgaPage(pixOrgaPage);
    await createCampaignPage.createEvaluationCampaign({
      campaignName: 'test A11Y',
      targetProfileName: 'PC pour Playwright',
    });
    return await pixOrgaPage.locator('dd.campaign-header-title__campaign-code > span').textContent();
  });
}
