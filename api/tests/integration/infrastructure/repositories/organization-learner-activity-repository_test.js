import { expect, databaseBuilder } from '../../../test-helper.js';
import * as organizationLearnerActivityRepository from '../../../../lib/infrastructure/repositories/organization-learner-activity-repository.js';
import { CampaignTypes } from '../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/CampaignParticipationStatuses.js';
const { SHARED } = CampaignParticipationStatuses;

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

    it('Should return an activity with all related attributes', async function () {
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

      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        status,
        createdAt,
        sharedAt,
      });

      await databaseBuilder.commit();

      //when
      const {
        organizationLearnerId: id,
        participations: [organizationLearnerParticipation],
      } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(id).to.equal(organizationLearnerId);
      expect(organizationLearnerParticipation.id).to.equal(participationId);
      expect(organizationLearnerParticipation.status).to.equal(status);
      expect(organizationLearnerParticipation.createdAt).to.deep.equal(createdAt);
      expect(organizationLearnerParticipation.sharedAt).to.deep.equal(sharedAt);
      expect(organizationLearnerParticipation.campaignName).to.equal(campaignName);
      expect(organizationLearnerParticipation.campaignType).to.equal(campaignType);
      expect(organizationLearnerParticipation.campaignId).to.equal(campaignId);
    });

    it('Should not return an activity with participations of another organization learner', async function () {
      //given
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const { id: otherOrganizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        type: CampaignTypes.PROFILES_COLLECTION,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 1,
        campaignId,
        organizationLearnerId,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 2,
        campaignId,
        otherOrganizationLearnerId,
      });

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(participations.length).to.equal(1);
      expect(participations[0].id).to.equal(1);
    });

    it('Should not return an activity with deleted participations', async function () {
      //given
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 1,
        organizationLearnerId,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 2,
        organizationLearnerId,
        deletedAt: new Date('2023-01-01'),
      });

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(participations.length).to.equal(1);
      expect(participations[0].id).to.equal(1);
    });
    it('Should not return an activity with improved participations', async function () {
      //given
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 1,
        organizationLearnerId,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 2,
        organizationLearnerId,
        isImproved: true,
      });

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(participations.length).to.equal(1);
      expect(participations[0].id).to.equal(1);
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
        createdAt: new Date('2000-01-01T10:00:00Z'),
        sharedAt: new Date('2000-01-02T10:00:00Z'),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: secondCampaignId,
        organizationLearnerId,
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
