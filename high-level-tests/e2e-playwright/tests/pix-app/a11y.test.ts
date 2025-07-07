import AxeBuilder from '@axe-core/playwright';
import { BrowserContext } from '@playwright/test';

import { buildAuthenticatedUsers } from '../../helpers/db.ts';
import { expect, test } from '../../helpers/fixtures.ts';

const routes = [
  // { path: '/accueil', title: 'Accueil | Pix' }, -> TODO FAILING
  { path: '/campagnes', title: "J'ai un code | Pix" },
  { path: '/certifications', title: 'Rejoindre une session de certification | Pix' },
  { path: '/competences', title: 'Compétences | Pix' },
  { path: '/mes-certifications', title: 'Mes certifications | Pix' },
  { path: '/mes-formations', title: 'Mes formations | Pix' },
];

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
});

routes.forEach(({ path, title }) => {
  test(`check a11y for route ${path}`, async ({ pixAppUserContext }: { pixAppUserContext: BrowserContext }) => {
    const page = await pixAppUserContext.newPage();
    await page.goto(process.env.PIX_APP_URL + path);
    await expect(page).toHaveTitle(title);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
