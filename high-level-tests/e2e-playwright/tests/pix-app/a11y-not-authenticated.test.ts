import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '../../fixtures/index.ts';
import { A11Y_VIEWPORTS, disableAnimation } from '../../helpers/utils.ts';

const routes = [
  { path: '/mot-de-passe-oublie', title: 'Mot de passe oublié | Pix' },
  { path: '/connexion', title: 'Connexion | Pix' },
  { path: '/inscription', title: 'Inscription | Pix' },
  { path: '/nonconnecte', title: 'Déconnecté | Pix' },
  //{ path: '/recuperer-mon-compte', title: 'Récupérer mon compte | Pix' }, -> TODO FAILING
  { path: '/verification-certificat', title: 'Vérifier un certificat Pix | Pix' },
  { path: '/modules/6a68bf32/bac-a-sable/details', title: 'Bac à sable | Pix' },
  //{ path: '/modules/6a68bf32/bac-a-sable/passage', title: 'Bac à sable | Pix' }, -> TODO FAILING
  //{ path: '/verification-extension-certification', title: 'Pix' }, -> TODO FAILING
  { path: '/resultats-session', title: 'Télécharger les résultats de session | Pix' },
];

test.describe('Check a11y for non authenticated pages', () => {
  routes.forEach(({ path, title }) => {
    test(`page ${path}`, async ({ page }) => {
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
});
