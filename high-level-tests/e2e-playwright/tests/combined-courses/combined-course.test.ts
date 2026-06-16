import { randomUUID } from 'node:crypto';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixOrgaUser, createCombinedCourseBlueprintInDB, knex } from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-app/LoginPage.ts';
import { PixOrgaPage } from '../../pages/pix-orga/PixOrgaPage.ts';

let uid: string;

test.slow();

test.beforeEach(async () => {
  uid = randomUUID().slice(-8);
  await createDataForCombinedCourse(uid);
});

test('Combined courses', async ({ page }) => {
  const orgaPage = new PixOrgaPage(page);

  await test.step('Login to pixOrga', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await orgaPage.login(`admin-${uid}@example.net`, 'pix123');
    await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
    await orgaPage.acceptCGU();
  });

  await test.step('Display combined course', async () => {
    await page.getByLabel('Navigation principale').getByRole('link', { name: 'Campagnes' }).click();
    await page.getByRole('link', { name: 'Parcours apprenants' }).click();
    await page.getByRole('link', { name: 'Mon parcours combiné' }).click();
    await expect(page.getByText('Aucun participant pour l’instant')).toBeVisible();
  });

  await test.step('Combined course', async () => {
    await page.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${uid}@example.net`, 'Coucoulesdevs66');
    await page.getByRole('link', { name: "J'ai un code" }).click();
    await page.getByLabel('Saisir votre code pour').fill(`C${uid.toUpperCase()}`);
    await page.getByRole('button', { name: 'Accéder au parcours' }).click();

    await test.step('Start combined course', async function () {
      await page.getByRole('button', { name: 'Commencer mon parcours' }).click();
    });

    await test.step('Run campaign', async function () {
      await page.getByRole('button', { name: 'Je commence' }).click();
      await page.getByRole('button', { name: 'Ignorer' }).click();
      await page.getByText('Oui.').click();
      await page.getByRole('button', { name: 'Je valide et je vais à la' }).click();
      await page.getByRole('link', { name: 'Voir mes résultats' }).first().click();
      await page.getByRole('link', { name: 'Continuer' }).click();
    });

    await test.step('Resume combined course', async function () {
      await page.getByRole('button', { name: 'Continuer mon parcours' }).click();
    });

    await test.step('Run module', async function () {
      await page.getByRole('button', { name: 'Commencer le module' }).click();
      await page.getByRole('button', { name: 'Terminer' }).click();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Module terminé !');
      await page.getByRole('button', { name: 'Continuer' }).click();
    });

    await test.step('End of combined course', async function () {
      await expect(page.getByRole('heading', { name: 'Félicitations ! Vous avez terminé !' })).toBeVisible();
    });
  });

  await test.step('Display combined course participation details', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await page.getByLabel('Navigation principale').getByRole('link', { name: 'Campagnes' }).click();
    await page.getByRole('link', { name: 'Parcours apprenants' }).click();
    await page.getByRole('link', { name: 'Mon parcours combiné' }).click();
    await expect(
      page.getByRole('region').filter({ hasText: 'Participations complétées' }).getByText('1', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('region').filter({ hasText: 'Total des participations' }).getByText('1', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Summers' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Buffy' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Terminé' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Une campagne complétée sur 1.' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Un module complété sur 1.' })).toBeVisible();
  });
});

/*
Creates a simple combined course with a campaign and an always recommended module
 */
async function createDataForCombinedCourse(uid: string) {
  const { userId, targetProfileId } = await buildFreshPixOrgaUser(
    'Adi',
    'Minh',
    `admin-${uid}@example.net`,
    'pix123',
    'ADMIN',
    {
      type: 'PRO',
      externalId: `PRO_MANAGING-${uid}`,
      isManagingStudents: false,
    },
  );
  const { id: organizationId } = await knex('organizations')
    .where({ externalId: `PRO_MANAGING-${uid}` })
    .first();

  const TARGET_PROFILE_TUBES = [
    {
      id: 'recSqw34xWSLgEgt',
      level: 1,
    },
  ];
  const CAMPAIGN_SKILLS = ['rec1aqbvWEqtoMOLw'];
  const [{ id: campaignId }] = await knex('campaigns')
    .insert({
      targetProfileId,
      name: 'campagne diag',
      code: uid.toUpperCase(),
      organizationId,
      creatorId: userId,
      ownerId: userId,
      type: 'ASSESSMENT',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: `${process.env.PIX_APP_URL}/parcours/C${uid.toUpperCase()}`,
    })
    .returning('id');
  await knex('campaign_skills').insert({ campaignId, skillId: CAMPAIGN_SKILLS[0] });
  await knex('target-profile_tubes').insert({
    targetProfileId,
    level: TARGET_PROFILE_TUBES[0].level,
    tubeId: TARGET_PROFILE_TUBES[0].id,
  });
  const [{ id: trainingId }] = await knex('trainings')
    .insert({
      title: 'demo combinix 1',
      link: '/modules/demo-combinix-1',
      type: 'modulix',
      duration: 1,
      locales: ['fr'],
      editorName: 'demo',
      editorLogoUrl: 'demo',
    })
    .returning('id');

  const moduleId1 = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
  await knex('target-profile-trainings').insert({ targetProfileId, trainingId });
  await knex('training-triggers').insert({ trainingId, threshold: 0, type: 'prerequisite' });
  await knex('training-triggers').insert({ trainingId, threshold: 100, type: 'goal' });

  const successRequirements = JSON.stringify([
    {
      requirement_type: 'campaignParticipations',
      comparison: 'all',
      data: {
        campaignId: {
          data: campaignId,
          comparison: 'equal',
        },
        status: {
          data: 'SHARED',
          comparison: 'equal',
        },
      },
    },
    {
      requirement_type: 'passages',
      comparison: 'all',
      data: {
        moduleId: {
          data: moduleId1,
          comparison: 'equal',
        },
        isTerminated: {
          data: true,
          comparison: 'equal',
        },
      },
    },
  ]);
  const eligibilityRequirements = JSON.stringify([]);
  const [{ id: questId }] = await knex('quests')
    .insert({
      successRequirements,
      eligibilityRequirements,
    })
    .returning('id');

  const combinedCourseBlueprintId = await createCombinedCourseBlueprintInDB('combinedCourseBlueprint');

  await knex('combined_courses').insert({
    name: 'Mon parcours combiné',
    code: `C${uid.toUpperCase()}`,
    organizationId,
    combinedCourseBlueprintId,
    questId,
  });
}
