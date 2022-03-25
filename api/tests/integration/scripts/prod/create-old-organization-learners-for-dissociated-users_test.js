const { expect, databaseBuilder, knex } = require('../../../test-helper');
const createOldOrganizationLearnersForDissociatedUsers = require('../../../../scripts/prod/create-old-organization-learners-for-dissociated-users.js');
const pick = require('lodash/pick');

describe('Integration | Scripts | create-old-organization-learners-for-dissociated-users', function () {
  describe('#createOldOrganizationLearnersForDissociatedUsers', function () {
    it('should create a new organizationLearner', async function () {
      const user = databaseBuilder.factory.buildUser({ firstName: 'Henri', lastName: 'Golo' });
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildSchoolingRegistration().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        schoolingRegistrationId: organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        schoolingRegistrationId: organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(2);
      const organizationLearnersToCheck = organizationLearners.map((organizationLearner) =>
        pick(organizationLearner, ['userId', 'firstName', 'lastName', 'organizationId'])
      );
      expect(organizationLearnersToCheck).to.deep.include.members([
        {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: campaign.organizationId,
        },
      ]);
    });
  });
});
