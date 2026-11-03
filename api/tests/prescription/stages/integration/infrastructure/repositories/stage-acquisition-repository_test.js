import { expect } from 'chai';

import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.ts';
import { StageAcquisition } from '../../../../../../src/prescription/stages/domain/models/StageAcquisition.js';
import {
  getAverageReachedStageByCampaignId,
  getByCampaignId,
  getByCampaignParticipation,
  getByCampaignParticipations,
  getStageIdsByCampaignParticipation,
  saveStages,
} from '../../../../../../src/prescription/stages/infrastructure/repositories/stage-acquisition-repository.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Evaluation | Integration | Repository | Stage Acquisition', function () {
  describe('getByCampaignParticipation', function () {
    let stageAcquisition;

    beforeEach(async function () {
      // given
      stageAcquisition = databaseBuilder.factory.buildStageAcquisition();
      await databaseBuilder.commit();
    });

    it('should return the expected stage', async function () {
      // when
      const result = await getByCampaignParticipation(stageAcquisition.campaignParticipationId);

      // then
      expect(result.length).to.deep.equal(1);
    });
  });

  describe('getStageIdsByCampaignParticipation', function () {
    let campaignParticipation;

    beforeEach(async function () {
      // given
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();

      databaseBuilder.factory.buildStage({ id: 123 });
      databaseBuilder.factory.buildStage({ id: 456 });
      databaseBuilder.factory.buildStage({ id: 789 });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: 123,
        campaignParticipationId: campaignParticipation.id,
      });
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 456,
        campaignParticipationId: campaignParticipation.id,
      });
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 789,
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();
    });

    it('should return the expected stage ids', async function () {
      // when
      const result = await getStageIdsByCampaignParticipation(campaignParticipation.id);

      // then
      expect(result.length).to.deep.equal(3);
      expect(result).to.include(123);
      expect(result).to.include(456);
      expect(result).to.include(789);
    });
  });

  describe('getByCampaignParticipations', function () {
    let firstStage;
    let secondStage;

    beforeEach(async function () {
      // given
      firstStage = databaseBuilder.factory.buildStageAcquisition();
      secondStage = databaseBuilder.factory.buildStageAcquisition();

      await databaseBuilder.commit();
    });

    it('should return StageAcquisition instances', async function () {
      // when
      const result = await getByCampaignParticipations([
        firstStage.campaignParticipationId,
        secondStage.campaignParticipationId,
      ]);

      // then
      expect(result[0]).to.be.instanceof(StageAcquisition);
    });

    it('should return the expected stages', async function () {
      // when
      const result = await getByCampaignParticipations([
        firstStage.campaignParticipationId,
        secondStage.campaignParticipationId,
      ]);

      // then
      expect(result.length).to.deep.equal(2);
    });
  });

  describe('getByCampaignId', function () {
    let campaignId;
    let stageId;
    let expectedStageAcquisitionIds;

    beforeEach(async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      stageId = databaseBuilder.factory.buildStage({ targetProfileId }).id;

      const firstSharedParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      const secondSharedParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      expectedStageAcquisitionIds = [
        databaseBuilder.factory.buildStageAcquisition({ stageId, campaignParticipationId: firstSharedParticipationId })
          .id,
        databaseBuilder.factory.buildStageAcquisition({ stageId, campaignParticipationId: secondSharedParticipationId })
          .id,
      ];

      await databaseBuilder.commit();
    });

    it('should return StageAcquisition instances', async function () {
      // when
      const result = await getByCampaignId(campaignId);

      // then
      expect(result[0]).to.be.instanceof(StageAcquisition);
    });

    it('should return stage acquisitions of shared participations of the campaign', async function () {
      // when
      const result = await getByCampaignId(campaignId);

      // then
      expect(result.map(({ id }) => id)).to.have.members(expectedStageAcquisitionIds);
    });

    it('should not return stage acquisitions of improved participations', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        isImproved: true,
      }).id;
      databaseBuilder.factory.buildStageAcquisition({ stageId, campaignParticipationId });
      await databaseBuilder.commit();

      // when
      const result = await getByCampaignId(campaignId);

      // then
      expect(result.map(({ id }) => id)).to.have.members(expectedStageAcquisitionIds);
    });

    it('should not return stage acquisitions of deleted participations', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        deletedAt: new Date('2020-01-03'),
      }).id;
      databaseBuilder.factory.buildStageAcquisition({ stageId, campaignParticipationId });
      await databaseBuilder.commit();

      // when
      const result = await getByCampaignId(campaignId);

      // then
      expect(result.map(({ id }) => id)).to.have.members(expectedStageAcquisitionIds);
    });

    it('should not return stage acquisitions of unshared participations', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: CampaignParticipationStatuses.STARTED,
      }).id;
      databaseBuilder.factory.buildStageAcquisition({ stageId, campaignParticipationId });
      await databaseBuilder.commit();

      // when
      const result = await getByCampaignId(campaignId);

      // then
      expect(result.map(({ id }) => id)).to.have.members(expectedStageAcquisitionIds);
    });

    it('should not return stage acquisitions of participations of another campaign', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      databaseBuilder.factory.buildStageAcquisition({ stageId, campaignParticipationId });
      await databaseBuilder.commit();

      // when
      const result = await getByCampaignId(campaignId);

      // then
      expect(result.map(({ id }) => id)).to.have.members(expectedStageAcquisitionIds);
    });
  });

  describe('saveStages', function () {
    let targetProfile;
    let stages;
    let campaign;
    let campaignParticipation;

    beforeEach(async function () {
      // given
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      stages = [
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id }),
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id }),
      ];
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });

      await databaseBuilder.commit();
    });

    it('return the expected stage', async function () {
      // when
      await saveStages(stages, campaignParticipation.id);

      // then
      const result = await knex('stage-acquisitions')
        .whereIn(
          'stageId',
          stages.map(({ id }) => id),
        )
        .andWhere('campaignParticipationId', campaignParticipation.id);

      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.contains({ stageId: stages[0].id });
    });
  });

  describe(getAverageReachedStageByCampaignId.name, function () {
    it('should return the averaged reached stage for a campaign (round under)', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;

      databaseBuilder.factory.buildStage({ id: 1, targetProfileId });
      databaseBuilder.factory.buildStage({ id: 2, targetProfileId });
      databaseBuilder.factory.buildStage({ id: 3, targetProfileId });

      const campaignParticipationId1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      }).id;

      const campaignParticipationId2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      }).id;

      const campaignParticipationId3 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      }).id;

      // first participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 1,
        campaignParticipationId: campaignParticipationId1,
      });
      // first participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 2,
        campaignParticipationId: campaignParticipationId1,
      });

      // second participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({ stageId: 1, campaignParticipationId: campaignParticipationId2 });
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 2,
        campaignParticipationId: campaignParticipationId2,
      });

      // third participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 1,
        campaignParticipationId: campaignParticipationId3,
      });
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 2,
        campaignParticipationId: campaignParticipationId3,
      });
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 3,
        campaignParticipationId: campaignParticipationId3,
      });

      await databaseBuilder.commit();

      // when
      const averageReachedStageNumber = await getAverageReachedStageByCampaignId(campaignId);

      // then
      expect(averageReachedStageNumber).to.deep.equal(2);
    });

    it('should return the averaged reached stage for a campaign (round up)', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;

      databaseBuilder.factory.buildStage({ id: 1, targetProfileId });
      databaseBuilder.factory.buildStage({ id: 2, targetProfileId });
      databaseBuilder.factory.buildStage({ id: 3, targetProfileId });

      const campaignParticipationId1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      }).id;

      const campaignParticipationId2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      }).id;

      const campaignParticipationId3 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      }).id;

      // first participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 1,
        campaignParticipationId: campaignParticipationId1,
      });
      // first participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 2,
        campaignParticipationId: campaignParticipationId1,
      });

      // second participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({ stageId: 1, campaignParticipationId: campaignParticipationId2 });
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 2,
        campaignParticipationId: campaignParticipationId2,
      });

      // third participation acquired stages
      databaseBuilder.factory.buildStageAcquisition({
        stageId: 1,
        campaignParticipationId: campaignParticipationId3,
      });

      await databaseBuilder.commit();

      // when
      const averageReachedStageNumber = await getAverageReachedStageByCampaignId(campaignId);

      // then
      expect(averageReachedStageNumber).to.deep.equal(2);
    });
  });
});
