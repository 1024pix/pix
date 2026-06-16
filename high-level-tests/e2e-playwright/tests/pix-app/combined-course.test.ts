import { expect, test } from '../../fixtures/index.ts';
import {
  buildFreshPixAppUser,
  createCombinedCourseBlueprintInDB,
  createOrganizationInDB,
  createTargetProfileInDB,
  knex,
} from '../../helpers/db.js';
import { ReconciliationLoginPage } from '../../pages/pix-app/ReconciliationLoginPage.js';
import { ReconciliationPage } from '../../pages/pix-app/ReconciliationPage.js';

test('pass a combined course as sco user and see the final result', async ({ page }) => {
  await createDataForCombinedCourse();

  await page.goto(`${process.env.PIX_APP_URL}/parcours/COMBINIX1/`);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  const reconciliationLoginPage = new ReconciliationLoginPage(page);
  await reconciliationLoginPage.login('alain.terieur@example.net', 'pix123');

  const reconciliationPage = new ReconciliationPage(page);
  await reconciliationPage.reconcile('Alain', 'Terieur', '10/07/2010', true);

  await test.step('Start combined course', async function () {
    await page.getByRole('button', { name: 'Commencer mon parcours' }).click();
  });

  await test.step('Run campaign', async function () {
    await page.getByRole('button', { name: 'Je commence' }).click();
    await page.getByRole('button', { name: 'Ignorer' }).click();
    await page.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }).click();
    await page.getByRole('link', { name: 'Voir mes résultats' }).first().click();
    await page.getByRole('link', { name: 'Continuer' }).click();
  });

  await test.step('Resume combined course', async function () {
    await page.getByRole('button', { name: 'Continuer mon parcours' }).click();
  });

  await test.step('Run module', async function () {
    await page.getByRole('button', { name: 'Commencer le module' }).click();
    await page.getByRole('button', { name: 'Terminer' }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();
  });

  await test.step('End of combined course', async function () {
    await expect(page.getByRole('heading', { name: 'Félicitations ! Vous avez terminé !' })).toBeVisible();
  });
});

/*
Creates a simple combined course with a campaign and an always recommended module
 */
async function createDataForCombinedCourse() {
  const TARGET_PROFILE_TUBES = [
    {
      id: 'recSqw34xWSLgEgt',
      level: 1,
    },
  ];
  const CAMPAIGN_SKILLS = ['rec1aqbvWEqtoMOLw'];
  const email = 'alain.terieur@example.net';
  const firstName = 'Alain';
  const lastName = 'Terieur';
  const birthdate = new Date('2010-07-10');
  const userId = await buildFreshPixAppUser(firstName, lastName, email, 'pix123', false);
  const organizationId = await createOrganizationInDB({ type: 'SCO', externalId: '123', isManagingStudents: true });
  await knex('organization-learners').insert({ firstName, lastName, birthdate, organizationId });
  const targetProfileId = await createTargetProfileInDB('targetProfile');
  const combinedCourseBlueprintId = await createCombinedCourseBlueprintInDB('combinedCourseBlueprint');
  const [{ id: campaignId }] = await knex('campaigns')
    .insert({
      targetProfileId,
      name: 'campagne diag',
      code: 'ASSDIAG12',
      organizationId,
      creatorId: userId,
      ownerId: userId,
      type: 'ASSESSMENT',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: `${process.env.PIX_APP_URL}/parcours/COMBINIX1`,
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

  await knex('combined_courses').insert({
    name: 'Mon parcours combiné',
    code: 'COMBINIX1',
    organizationId,
    combinedCourseBlueprintId,
    questId,
  });
}
