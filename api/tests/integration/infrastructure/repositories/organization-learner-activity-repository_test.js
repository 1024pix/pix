const { expect, databaseBuilder } = require('../../../test-helper');
const organizationLearnerActivityRepository = require('../../../../lib/infrastructure/repositories/organization-learner-activity-repository');
const CampaignTypes = require('../../../../lib/domain/models/CampaignTypes');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Integration | Infrastructure | Repository | organization-learner-activity', function () {
  describe('#get', function () {
    it('Should return an activity with an empty participation list when no participations were found ', async function () {
      //given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      //when
      const organizationLearnerActivity = await organizationLearnerActivityRepository.get(organizationLearner.id);
      //then
      expect(organizationLearnerActivity.participations.length).to.equal(0);
    });

    it('Should return an activity with an empty participation list when organization learner does not exist ', async function () {
      //given //when
      const organizationLearnerActivity = await organizationLearnerActivityRepository.get(404);
      //then
      expect(organizationLearnerActivity.participations.length).to.equal(0);
    });

    it('Should return an activity with all attributes of existing participations', async function () {
      //given
      const status = SHARED;
      const createdAt = new Date('2000-01-01T10:00:00Z');
      const sharedAt = new Date('2000-01-02T10:00:00Z');
      const campaignName = 'Aurelies super campaign';
      const campaignType = CampaignTypes.PROFILES_COLLECTION;
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();

      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: campaignName,
        type: campaignType,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        status,
        createdAt,
        sharedAt,
      });

      await databaseBuilder.commit();

      //when
      const {
        participations: [organizationLearnerParticipation],
      } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(organizationLearnerParticipation.status).to.equal(status);
      expect(organizationLearnerParticipation.createdAt).to.deep.equal(createdAt);
      expect(organizationLearnerParticipation.sharedAt).to.deep.equal(sharedAt);
      expect(organizationLearnerParticipation.campaignName).to.equal(campaignName);
      expect(organizationLearnerParticipation.campaignType).to.equal(campaignType);
    });

    it('Should not return an activity with participations of another organization learner', async function () {
      //given
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const { id: otherOrganizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'other not so great campaign',
        type: CampaignTypes.PROFILES_COLLECTION,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-01T10:00:00Z'),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        otherOrganizationLearnerId,
        createdAt: new Date('2005-01-01T10:00:00Z'),
      });

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(participations.length).to.equal(1);
      expect(participations[0].createdAt).to.deep.equal(new Date('2000-01-01T10:00:00Z'));
    });

    it('Should return an activity with the participations in anti-chronological order', async function () {
      //given
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();

      const { id: firstCampaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Aurelies super campaign',
        type: CampaignTypes.PROFILES_COLLECTION,
      });

      const { id: secondCampaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Karams super campaign',
        type: CampaignTypes.ASSESSMENT,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: firstCampaignId,
        organizationLearnerId,
        status: SHARED,
        createdAt: new Date('2000-01-01T10:00:00Z'),
        sharedAt: new Date('2000-01-02T10:00:00Z'),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: secondCampaignId,
        organizationLearnerId,
        status: STARTED,
        createdAt: new Date('2000-01-03T10:00:00Z'),
      });

      await databaseBuilder.commit();

      //when
      const {
        participations: [secondOrganizationLearnerParticipation, firstOrganizationLearnerParticipation],
      } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(secondOrganizationLearnerParticipation.createdAt).to.deep.equal(new Date('2000-01-03T10:00:00Z'));
      expect(firstOrganizationLearnerParticipation.createdAt).to.deep.equal(new Date('2000-01-01T10:00:00Z'));
    });
  });
});
