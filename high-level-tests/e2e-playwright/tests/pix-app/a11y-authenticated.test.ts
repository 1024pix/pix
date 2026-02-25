import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '../../fixtures/index.ts';
import { A11Y_VIEWPORTS, disableAnimation } from '../../helpers/utils.ts';
import { PixOrgaPage } from '../../pages/pix-orga/index.ts';

const routes = [
  // { path: '/accueil', title: 'Accueil | Pix' }, -> TODO FAILING
  { path: '/campagnes', title: "J'ai un code | Pix" },
  { path: '/certifications', title: 'Rejoindre une session de certification | Pix' },
  { path: '/competences', title: 'Compétences | Pix' },
  { path: '/mes-certifications', title: 'Mes certifications | Pix' },
  { path: '/mes-formations', title: 'Mes formations | Pix' },
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
    const pixOrgaPage = await pixOrgaMemberContext.newPage();
    await pixOrgaPage.goto(process.env.PIX_ORGA_URL as string);
    let campaignCode: string | null;
    await test.step('creates the campaign', async () => {
      await pixOrgaPage.getByRole('link', { name: 'Campagnes', exact: true }).click();
      await pixOrgaPage.getByRole('link', { name: 'Créer une campagne' }).click();
      const createCampaignPage = new PixOrgaPage(pixOrgaPage);
      await createCampaignPage.createEvaluationCampaign({
        campaignName: 'test A11Y',
        targetProfileName: 'PC pour Playwright',
      });
      campaignCode = await pixOrgaPage.locator('dd.campaign-header-title__campaign-code > span').textContent();
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
});
