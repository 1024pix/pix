import * as organizationLearnerActivityRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-activity-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
const { SHARED, STARTED } = CampaignParticipationStatuses;

describe('Integration | Infrastructure | Repository | organization-learner-activity', function () {
  let organizationLearnerId, organizationId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

    await databaseBuilder.commit();
  });

  describe('#get', function () {
    it('Should return an activity with an empty participation list when no participations were found ', async function () {
      //given
      await databaseBuilder.commit();

      //when
      const organizationLearnerActivity = await organizationLearnerActivityRepository.get(organizationLearnerId);
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

    it('Should return total count of participations for each campaign for given organization learner', async function () {
      //given
      const { id: firstCampaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Iron man',
        type: CampaignTypes.PROFILES_COLLECTION,
      });

      const { id: secondCampaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Hulk',
        type: CampaignTypes.ASSESSMENT,
        multipleSendings: true,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: firstCampaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-01'),
        sharedAt: new Date('2000-01-02'),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: secondCampaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-03'),
        sharedAt: new Date('2000-12-12'),
        isImproved: true,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: secondCampaignId,
        organizationLearnerId,
        createdAt: new Date('2010-01-03'),
        sharedAt: new Date('2010-12-12'),
      });

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      const firstCampaignParticipations = participations.find((participation) => participation.campaignName === 'Hulk');
      const secondCampaignParticipations = participations.find(
        (participation) => participation.campaignName === 'Iron man',
      );
      //then
      expect(firstCampaignParticipations.participationCount).to.equal(2);
      expect(secondCampaignParticipations.participationCount).to.equal(1);
    });

    it('Should not return count of deleted participations for given organization learner', async function () {
      //given

      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Hulk',
        type: CampaignTypes.ASSESSMENT,
        multipleSendings: true,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-01'),
        sharedAt: new Date('2000-01-02'),
        deletedAt: new Date('2023-01-01'),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2022-01-03'),
        sharedAt: new Date('2022-12-12'),
      });

      await databaseBuilder.commit();

      //when
      const {
        participations: [undeletedParticipation],
      } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      //then
      expect(undeletedParticipation.participationCount).to.equal(1);
    });

    it('Should return the last participation by campaignId', async function () {
      //given
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Hulk',
        type: CampaignTypes.ASSESSMENT,
        multipleSendings: true,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 202,
        status: SHARED,
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-03'),
        sharedAt: new Date('2000-12-12'),
        isImproved: true,
      }).id;

      const lastParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        id: 203,
        status: STARTED,
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2010-01-03'),
        sharedAt: null,
      }).id;

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      const campaignParticipations = participations.find((participation) => participation.campaignName === 'Hulk');

      //then
      expect(campaignParticipations.lastCampaignParticipationId).to.deep.equal(lastParticipationId);
    });

    it('Should return the right participation for a given campaignId', async function () {
      //given
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Iron Man',
        type: CampaignTypes.ASSESSMENT,
        multipleSendings: true,
      });

      const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign({
        organizationId,
        name: 'Hulk',
        type: CampaignTypes.ASSESSMENT,
        multipleSendings: true,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        status: SHARED,
        campaignId: otherCampaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-01'),
        sharedAt: new Date('2000-01-02'),
      }).id;

      const rightParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        status: SHARED,
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2000-01-03'),
        sharedAt: new Date('2000-12-12'),
      }).id;

      await databaseBuilder.commit();

      //when
      const { participations } = await organizationLearnerActivityRepository.get(organizationLearnerId);

      const campaignParticipations = participations.find((participation) => participation.campaignName === 'Iron Man');

      //then
      expect(campaignParticipations.lastCampaignParticipationId).to.deep.equal(rightParticipationId);
    });
  });
});
