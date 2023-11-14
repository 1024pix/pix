import { expect, databaseBuilder, knex } from '../../../../test-helper.js';
import {
  getByCampaignIdAndUserId,
  getByCampaignParticipation,
  getByCampaignParticipations,
  getStageIdsByCampaignParticipation,
  saveStages,
} from '../../../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import { StageAcquisition } from '../../../../../src/evaluation/domain/models/StageAcquisition.js';

describe('Integration | Repository | Stage Acquisition', function () {
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

  describe('getByCampaignIdAndUserId', function () {
    let stage;
    let user;
    let campaign;
    let campaignParticipation;
    let targetProfile;

    beforeEach(async function () {
      // given
      user = databaseBuilder.factory.buildUser();
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      stage = databaseBuilder.factory.buildStage({ campaignId: campaign.id });
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      databaseBuilder.factory.buildStageAcquisition({
        campaignParticipationId: campaignParticipation.id,
        userId: user.id,
        stageId: stage.id,
      });

      await databaseBuilder.commit();
    });

    it('should return StageAcquisition instances', async function () {
      // when
      const result = await getByCampaignIdAndUserId(campaign.id, user.id);

      // then
      expect(result[0]).to.be.instanceof(StageAcquisition);
    });

    it('should return the expected stages', async function () {
      // when
      const result = await getByCampaignIdAndUserId(campaign.id, user.id);

      // then
      expect(result[0].stageId).to.deep.equal(stage.id);
    });
  });

  describe('saveStages', function () {
    let targetProfile;
    let stages;
    let campaign;
    let user;
    let campaignParticipation;

    beforeEach(async function () {
      // given
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      stages = [
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id }),
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id }),
      ];
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      user = databaseBuilder.factory.buildUser();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });

      await databaseBuilder.commit();
    });

    it('return the expected stage', async function () {
      // when
      await saveStages(stages, user.id, campaignParticipation.id);

      // then
      const result = await knex('stage-acquisitions')
        .whereIn(
          'stageId',
          stages.map(({ id }) => id),
        )
        .andWhere('userId', user.id)
        .andWhere('campaignParticipationId', campaignParticipation.id);

      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.contains({ stageId: stages[0].id });
    });
  });
});
