import { randomUUID } from 'node:crypto';

import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures/index.ts';
import { buildFreshPixOrgaUser, createCombinedCourseBlueprintInDB, knex } from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-app/LoginPage.ts';

const TARGET_PROFILE_TUBE = { id: 'recSqw34xWSLgEgt', level: 1 };
const CAMPAIGN_SKILL = 'rec1aqbvWEqtoMOLw';

const PARENT_NAME = 'Mon méta parcours';
const FIRST_CHILD_NAME = 'Mon premier parcours combiné';
const SECOND_CHILD_NAME = 'Mon second parcours combiné';

let uid: string;
let parentCode: string;

// The whole chain walks two campaigns across three combined courses.
test.setTimeout(300_000);

test.beforeEach(async () => {
  uid = randomUUID().slice(-8).toUpperCase();
  ({ parentCode } = await createDataForNestedCombinedCourse(uid));
});

test('pass a combined course composed of combined courses', async ({ page }) => {
  await test.step('Sign up and open the meta combined course link', async () => {
    await page.goto(process.env.PIX_APP_URL as string);
    const loginPage = new LoginPage(page);
    await loginPage.signup('Buffy', 'Summers', `buffy.summers.${uid}@example.net`, 'Coucoulesdevs66');
    // a learner gets a combined course as a link, which is also how the children are entered
    await page.goto(`${process.env.PIX_APP_URL}/parcours/${parentCode}`);
  });

  await test.step('The meta combined course lists its children, the second one locked', async () => {
    await expect(page.getByRole('heading', { name: PARENT_NAME })).toBeVisible();
    await expect(page.getByText(FIRST_CHILD_NAME)).toBeVisible();
    await expect(page.getByText(SECOND_CHILD_NAME)).toBeVisible();
    // the first child is a link (unlocked), the second one is not (locked behind the first)
    await expect(page.getByRole('link').filter({ hasText: FIRST_CHILD_NAME })).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: SECOND_CHILD_NAME })).toHaveCount(0);
  });

  await test.step('Start the meta combined course, which enters the first child', async () => {
    await page.getByRole('button', { name: 'Commencer mon parcours' }).click();
    await expect(page.getByRole('heading', { name: FIRST_CHILD_NAME })).toBeVisible();
  });

  await test.step('Complete the first child', async () => {
    await runChildCombinedCourse(page, FIRST_CHILD_NAME);
  });

  await test.step('Back on the meta combined course, the first child is done and the second unlocked', async () => {
    await page.getByRole('link', { name: 'Continuer' }).click();
    await expect(page.getByRole('heading', { name: PARENT_NAME })).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: SECOND_CHILD_NAME })).toBeVisible();
  });

  await test.step('Resume the meta combined course, which enters the second child', async () => {
    await page.getByRole('button', { name: 'Continuer mon parcours' }).click();
    await expect(page.getByRole('heading', { name: SECOND_CHILD_NAME })).toBeVisible();
  });

  await test.step('Complete the second child', async () => {
    await runChildCombinedCourse(page, SECOND_CHILD_NAME);
  });

  await test.step('The meta combined course is completed', async () => {
    await page.getByRole('link', { name: 'Continuer' }).click();
    await expect(page.getByRole('heading', { name: PARENT_NAME })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Félicitations ! Vous avez terminé !' })).toBeVisible();
    // no parent above the meta combined course, so no way to continue any further
    await expect(page.getByRole('link', { name: 'Continuer' })).toHaveCount(0);
  });
});

async function runChildCombinedCourse(page: Page, childName: string) {
  await page.getByRole('button', { name: 'Commencer mon parcours' }).click();

  await page.getByRole('button', { name: 'Je commence' }).click();
  // the tutorial popin only shows up on the very first challenge the user ever sees
  const skipTutorial = page.getByRole('button', { name: 'Ignorer' });
  try {
    await skipTutorial.waitFor({ state: 'visible', timeout: 5000 });
    await skipTutorial.click();
  } catch {
    // already dismissed by a previous campaign
  }
  await page.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }).click();
  await page.getByRole('link', { name: 'Voir mes résultats' }).first().click();
  await page.getByRole('link', { name: 'Continuer' }).click();

  await expect(page.getByRole('heading', { name: childName })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Félicitations ! Vous avez terminé !' })).toBeVisible();
}

/*
Creates a meta combined course whose two items are combined courses,
each made of a single campaign so that the whole chain stays quick to run.
 */
async function createDataForNestedCombinedCourse(uid: string) {
  const { userId, targetProfileId } = await buildFreshPixOrgaUser(
    'Adi',
    'Minh',
    `admin-${uid}@example.net`,
    'pix123',
    'ADMIN',
    { type: 'PRO', externalId: `PRO_NESTED-${uid}`, isManagingStudents: false },
  );
  const { id: organizationId } = await knex('organizations')
    .where({ externalId: `PRO_NESTED-${uid}` })
    .first();

  await knex('target-profile_tubes').insert({
    targetProfileId,
    level: TARGET_PROFILE_TUBE.level,
    tubeId: TARGET_PROFILE_TUBE.id,
  });

  const firstChildId = await createChildCombinedCourse({
    name: FIRST_CHILD_NAME,
    campaignCode: `1${uid}`,
    combinedCourseCode: `A${uid}`,
    organizationId,
    userId,
    targetProfileId,
  });
  const secondChildId = await createChildCombinedCourse({
    name: SECOND_CHILD_NAME,
    campaignCode: `2${uid}`,
    combinedCourseCode: `B${uid}`,
    organizationId,
    userId,
    targetProfileId,
  });

  const successRequirements = JSON.stringify(
    [firstChildId, secondChildId].map((combinedCourseId) => ({
      requirement_type: 'combinedCourses',
      comparison: 'all',
      data: {
        combinedCourseId: { data: combinedCourseId, comparison: 'equal' },
        status: { data: 'COMPLETED', comparison: 'equal' },
      },
    })),
  );
  const [{ id: questId }] = await knex('quests')
    .insert({ successRequirements, eligibilityRequirements: JSON.stringify([]) })
    .returning('id');
  const combinedCourseBlueprintId = await createCombinedCourseBlueprintInDB('metaCombinedCourseBlueprint');

  const parentCode = `P${uid}`;
  await knex('combined_courses').insert({
    name: PARENT_NAME,
    code: parentCode,
    organizationId,
    combinedCourseBlueprintId,
    questId,
  });

  return { parentCode, firstChildId, secondChildId };
}

async function createChildCombinedCourse({
  name,
  campaignCode,
  combinedCourseCode,
  organizationId,
  userId,
  targetProfileId,
}: {
  name: string;
  campaignCode: string;
  combinedCourseCode: string;
  organizationId: number;
  userId: number;
  targetProfileId: number;
}) {
  const [{ id: campaignId }] = await knex('campaigns')
    .insert({
      targetProfileId,
      name: `campagne ${campaignCode}`,
      code: campaignCode,
      organizationId,
      creatorId: userId,
      ownerId: userId,
      type: 'ASSESSMENT',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: `${process.env.PIX_APP_URL}/parcours/${combinedCourseCode}`,
    })
    .returning('id');
  await knex('campaign_skills').insert({ campaignId, skillId: CAMPAIGN_SKILL });

  const successRequirements = JSON.stringify([
    {
      requirement_type: 'campaignParticipations',
      comparison: 'all',
      data: {
        campaignId: { data: campaignId, comparison: 'equal' },
        status: { data: 'SHARED', comparison: 'equal' },
      },
    },
  ]);
  const [{ id: questId }] = await knex('quests')
    .insert({ successRequirements, eligibilityRequirements: JSON.stringify([]) })
    .returning('id');
  const combinedCourseBlueprintId = await createCombinedCourseBlueprintInDB(`blueprint ${combinedCourseCode}`);

  const [{ id: combinedCourseId }] = await knex('combined_courses')
    .insert({ name, code: combinedCourseCode, organizationId, combinedCourseBlueprintId, questId })
    .returning('id');

  return combinedCourseId;
}
