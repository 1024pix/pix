import { buildAuthenticatedUsers, databaseBuilder } from '../../helpers/db.js';
import { PIX_ORGA_SUP_ISMANAGING_DATA } from '../../helpers/db-data.js';
import { expect, test } from '../../helpers/fixtures.js';

let learnerPixAuth: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
  const organizationId = PIX_ORGA_SUP_ISMANAGING_DATA.organization.id;
  learnerPixAuth = databaseBuilder.factory.buildUser.withRawPassword();
  databaseBuilder.factory.buildOrganizationLearner({
    organizationId,
    firstName: learnerPixAuth.firstName,
    lastName: learnerPixAuth.lastName,
    userId: learnerPixAuth.id,
  });

  await databaseBuilder.commit();
});

test('Students management for a sco organization', async ({ pixOrgaSupIsManagingContext }) => {
  const page = await pixOrgaSupIsManagingContext.newPage();
  await page.goto(process.env.PIX_ORGA_URL as string);

  await page.getByRole('link', { name: 'Étudiants' }).click();
  await expect(page.getByRole('heading', { name: 'Étudiant (1)' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Tableau des étudiants trié' })).toBeVisible();
});
