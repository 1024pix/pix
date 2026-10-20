import { test } from '../../fixtures/index.ts';
import {
    buildExistingOrganizationLearner,
    createCampaignInDB,
    createCampaignParticipationInDB,
    createOrganizationInDB,
    knex,
} from '../../helpers/db.ts';
import { LoginPage } from '../../pages/pix-app/index.ts';

test('Show dashboard', async ({ page }) => {
  await createDashboardData();
  const loginPage = new LoginPage(page);
  await loginPage.login('bruce.wayne@example.com', 'Azerty123*');
});

async function createDashboardData() {
  const organizationId = await createOrganizationInDB({ type: 'SCO', externalId: '123', isManagingStudents: false });

  const campaignId = await createCampaignInDB(
    {
      name: 'Bruce',
      code: 'CODE123',
      title: 'Bruce Campaign',
      organizationId,
      type: 'ASSESSMENT',
    },
    knex,
  );

  const learner = await buildExistingOrganizationLearner({
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce.wayne@example.com',
    birthdate: '1990-01-01',
    nationalStudentId: '123',
    isDisabled: false,
    rawPassword: 'Azerty123*',
    organizationId,
  });

  await createCampaignParticipationInDB(
    {
      campaignId,
      organizationLearnerId: learner.organizationLearnerId,
      userId: learner.userId,
    },
    knex,
  );
}
