import { buildAuthenticatedUsers, databaseBuilder } from '../../helpers/db.js';
import { PIX_ORGA_SCO_ISMANAGING_DATA } from '../../helpers/db-data.js';
import { expect, test } from '../../helpers/fixtures.js';

let learnerPixAuth: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};
let learnerNotLinked: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};
let learnerGarAuth: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

test.beforeEach(async () => {
  await buildAuthenticatedUsers({ withCguAccepted: true });
  const organizationId = PIX_ORGA_SCO_ISMANAGING_DATA.organization.id;
  // Learner with no user linked
  learnerNotLinked = databaseBuilder.factory.buildOrganizationLearner({
    organizationId,
    lastName: 'NoUser',
    userId: null,
  });

  // Learner linked to user with PIX authentication method
  learnerPixAuth = databaseBuilder.factory.buildUser.withRawPassword({
    lastName: 'PixUser',
    email: 'pix@user.com',
    username: 'pix.user',
  });
  databaseBuilder.factory.buildOrganizationLearner({
    organizationId,
    firstName: learnerPixAuth.firstName,
    lastName: learnerPixAuth.lastName,
    userId: learnerPixAuth.id,
  });

  // Learner linked to user with GAR authentication method
  learnerGarAuth = databaseBuilder.factory.buildUser({ lastName: 'GarUser', username: null, email: null });
  databaseBuilder.factory.buildOrganizationLearner({
    organizationId,
    firstName: learnerGarAuth.firstName,
    lastName: learnerGarAuth.lastName,
    userId: learnerGarAuth.id,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    firstName: learnerGarAuth.firstName,
    lastName: learnerGarAuth.lastName,
    userId: learnerGarAuth.id,
  });

  await databaseBuilder.commit();
});

test('Students management for a sco organization', async ({ pixOrgaScoIsManagingContext }) => {
  const page = await pixOrgaScoIsManagingContext.newPage();

  await page.goto(process.env.PIX_ORGA_URL as string);
  await page.getByRole('heading', { name: 'Campagnes' }).waitFor();

  await page.getByRole('link', { name: 'Élèves' }).click();
  await expect(page.getByRole('heading', { name: 'Élèves (3)' })).toBeVisible();

  await test.step('Changes password of a learner having a PIX authentication method', async () => {
    const row = page.getByRole('row').filter({ hasText: learnerPixAuth.lastName });
    await row.getByRole('button', { name: 'Afficher les actions' }).click();
    await row.getByRole('button', { name: 'Gérer le compte' }).click();

    const dialog = page.getByRole('dialog', { name: 'Gestion du compte Pix de l’élève' });
    await expect(dialog.getByRole('textbox', { name: 'Adresse e-mail' })).toHaveValue(learnerPixAuth.email);
    await expect(dialog.getByRole('textbox', { name: 'Identifiant' })).toHaveValue(learnerPixAuth.username);

    await dialog.getByRole('button', { name: 'Réinitialiser le mot de passe' }).click();
    await expect(dialog.getByText('Nouveau mot de passe à usage unique')).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Nouveau mot de passe à usage unique' })).toHaveValue(
      /[a-zA-Z0-9]{8}/,
    );
    await dialog.getByRole('button', { name: 'Fermer' }).click();
  });

  await test.step('Creates a username for a learner having a GAR authentication method', async () => {
    const row = page.getByRole('row').filter({ hasText: learnerGarAuth.lastName });
    await row.getByRole('button', { name: 'Afficher les actions' }).click();
    await row.getByRole('button', { name: 'Gérer le compte' }).click();

    const dialog = page.getByRole('dialog', { name: 'Gestion du compte Pix de l’élève' });
    await expect(dialog.getByText('Médiacentre')).toBeVisible();

    await dialog.getByRole('button', { name: 'Ajouter l’identifiant' }).click();
    await expect(dialog.getByRole('textbox', { name: 'Identifiant' })).toHaveValue('billy.garuser0508');
    await expect(dialog.getByText('Nouveau mot de passe à usage unique')).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Nouveau mot de passe à usage unique' })).toHaveValue(
      /[a-zA-Z0-9]{8}/,
    );
    await dialog.getByRole('button', { name: 'Fermer' }).click();
  });

  await test.step('No action available for learner not linked to a user', async () => {
    const row = page.getByRole('row').filter({ hasText: learnerNotLinked.lastName });
    await expect(row.getByRole('button', { name: 'Afficher les actions' })).not.toBeVisible();
  });
});
