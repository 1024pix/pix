import { randomUUID } from 'node:crypto';

import { expect, test } from '../../fixtures/index.ts';
import {
  buildExistingOrganizationLearner,
  createCampaignInDB,
  createCampaignParticipationInDB,
  createOrganizationInDB,
} from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-app/index.ts';

test('Show dashboard', async ({ page }) => {
  const data = await createDashboardData();
  await page.goto(`${process.env.PIX_APP_URL}`);
  const loginPage = new LoginPage(page);
  await loginPage.login(data.email, 'Azerty123*');
  await expect(page.getByText('Continuez vos parcours de test en cours')).toBeVisible();
  await expect(page.getByText('Bruce Campaign')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reprendre le parcours Bruce' })).toBeVisible();
  await expect(page.getByRole('heading', { name: "N'oubliez pas de finaliser votre envoi de profil" })).toBeVisible();
});

async function createDashboardData() {
  const uid = randomUUID().slice(-4);
  const organizationId = await createOrganizationInDB({ type: 'SCO', externalId: '123', isManagingStudents: false });

  const learner = await buildExistingOrganizationLearner({
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: `bruce.wayne${uid}@example.com`,
    birthdate: '1990-01-01',
    nationalStudentId: '123',
    isDisabled: false,
    rawPassword: 'Azerty123*',
    organizationId,
  });

  const assessmentCampaignId = await createCampaignInDB({
    name: 'Bruce',
    code: `ASS${uid}`,
    title: 'Bruce Campaign',
    organizationId,
    type: 'ASSESSMENT',
  });
  const profileCampaignId = await createCampaignInDB({
    name: 'Bruce',
    code: `COLL${uid}`,
    title: 'Bruce Campaign',
    organizationId,
    type: 'PROFILES_COLLECTION',
  });

  await createCampaignParticipationInDB({
    campaignId: assessmentCampaignId,
    organizationLearnerId: learner.organizationLearnerId,
    userId: learner.userId,
  });
  await createCampaignParticipationInDB({
    campaignId: profileCampaignId,
    organizationLearnerId: learner.organizationLearnerId,
    userId: learner.userId,
  });

  return { email: `bruce.wayne${uid}@example.com`, campaignCode: `CAMPAI${uid}` };
}
