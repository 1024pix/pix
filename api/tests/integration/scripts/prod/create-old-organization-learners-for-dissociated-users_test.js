const { expect, databaseBuilder, knex } = require('../../../test-helper');
const createOldOrganizationLearnersForDissociatedUsers = require('../../../../scripts/prod/create-old-organization-learners-for-dissociated-users.js');
const pick = require('lodash/pick');

describe('Integration | Scripts | create-old-organization-learners-for-dissociated-users', function () {
  afterEach(async function () {
    await knex('campaign-participations').delete();
    await knex('organization-learners').delete();
  });

  describe('#createOldOrganizationLearnersForDissociatedUsers', function () {
    it('should create a new organizationLearner with disabled status', async function () {
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
        pick(organizationLearner, ['userId', 'firstName', 'lastName', 'organizationId', 'isDisabled'])
      );
      expect(organizationLearnersToCheck).to.deep.include.members([
        {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: campaign.organizationId,
          isDisabled: true,
        },
      ]);
    });

    it('should create a new organizationLearner for both old participations', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign1 = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildSchoolingRegistration().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign1.id,
        schoolingRegistrationId: organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        schoolingRegistrationId: organizationLearnerId,
        createdAt: new Date(),
      });

      const campaign2 = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId2 = databaseBuilder.factory.buildSchoolingRegistration().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign2.id,
        schoolingRegistrationId: organizationLearnerId2,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        schoolingRegistrationId: organizationLearnerId2,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const organizationLearners = await knex('organization-learners');

      //then
      expect(organizationLearners.length).to.equal(4);
    });

    it('should create a new organizationLearner for old campaign participation only', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildSchoolingRegistration().id;
      const oldCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
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
      const [organizationLearner] = await knex('organization-learners').whereNot({ id: organizationLearnerId });
      const [updatedCampaignParticipation] = await knex('campaign-participations').where({
        id: oldCampaignParticipation.id,
      });

      //then
      expect(updatedCampaignParticipation.organizationLearnerId).to.equal(organizationLearner.id);
    });

    it('should not update with new organizationLearnerId all participations', async function () {
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign();
      const organizationLearnerId = databaseBuilder.factory.buildSchoolingRegistration().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        schoolingRegistrationId: organizationLearnerId,
        createdAt: new Date('2020-01-01'),
      });
      const recentCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        schoolingRegistrationId: organizationLearnerId,
        createdAt: new Date(),
      });

      await databaseBuilder.commit();

      //when
      await createOldOrganizationLearnersForDissociatedUsers(1, false);
      const [campaignParticipation] = await knex('campaign-participations').where({
        id: recentCampaignParticipation.id,
      });

      //then
      expect(campaignParticipation.organizationLearnerId).to.equal(recentCampaignParticipation.schoolingRegistrationId);
    });
  });
});
