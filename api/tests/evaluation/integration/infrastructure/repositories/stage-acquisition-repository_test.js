import { StageAcquisition } from '../../../../../src/evaluation/domain/models/StageAcquisition.js';
import {
  getAverageReachedStageByCampaignId,
  getByCampaignParticipation,
  getByCampaignParticipations,
  getStageIdsByCampaignParticipation,
  saveStages,
} from '../../../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

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
