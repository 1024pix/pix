const { expect, databaseBuilder, knex } = require('../../../test-helper');
const computeOrganizationLearners = require('../../../../scripts/prod/compute-organization-learners');

describe('computeOrganizationLearners', function () {
  it('does not update campaign participation already linked', async function () {
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: userId } = databaseBuilder.factory.buildUser();
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
    const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration();
    databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId,
      schoolingRegistrationId,
    });
    await databaseBuilder.commit();

    await computeOrganizationLearners(1, false);
    const campaignParticipation = await knex('campaign-participations').select('schoolingRegistrationId').first();

    expect(campaignParticipation.schoolingRegistrationId).to.equal(schoolingRegistrationId);
  });
});
