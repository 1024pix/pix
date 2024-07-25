import { usecases } from '../../../../lib/domain/usecases/index.js';
import { constants } from '../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, sinon } from '../../../test-helper.js';

describe('Integration | UseCase | find-user-campaign-participation-overviews_test', function () {
  describe('when there are several campaigns for several target profiles', function () {
    let user;

    beforeEach(async function () {
      // given
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      user = databaseBuilder.factory.buildUser();

      const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();

      const targetProfile1Stage1 = databaseBuilder.factory.buildStage({ targetProfileId: targetProfile1.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile1.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile1.id });

      const targetProfile2Stage2 = databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id });

      const campaign1 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile1.id });
      const campaign2 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile2.id });

      const campaign1Participation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        userId: user.id,
      });
      const campaign2Participation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        userId: user.id,
      });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: targetProfile1Stage1.id,
        userId: user.id,
        campaignParticipationId: campaign1Participation1.id,
      });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: targetProfile2Stage2.id,
        userId: user.id,
        campaignParticipationId: campaign2Participation2.id,
      });

      await databaseBuilder.commit();
    });

    it('should return campaign participations for a given user', async function () {
      // when
      const result = await usecases.findUserCampaignParticipationOverviews({
        userId: user.id,
      });

      // then
      expect(result.campaignParticipationOverviews.length).to.equal(2);
    });

    it('should return acquired stages', async function () {
      // when
      const result = await usecases.findUserCampaignParticipationOverviews({
        userId: user.id,
      });

      // then
      expect(result.campaignParticipationOverviews[0].totalStagesCount).to.equal(3);
      expect(result.campaignParticipationOverviews[0].validatedStagesCount).to.equal(1);
      expect(result.campaignParticipationOverviews[1].totalStagesCount).to.equal(5);
      expect(result.campaignParticipationOverviews[1].validatedStagesCount).to.equal(1);
    });
  });

  describe('when there are several campaigns for one target profile', function () {
    let user;

    beforeEach(async function () {
      // given
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      user = databaseBuilder.factory.buildUser();

      const targetProfile = databaseBuilder.factory.buildTargetProfile();

      const stage1 = databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });
      const stage2 = databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });

      const campaign1 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      const campaign2 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });

      const campaign1Participation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        userId: user.id,
      });
      const campaign2Participation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        userId: user.id,
      });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: stage1.id,
        userId: user.id,
        campaignParticipationId: campaign1Participation1.id,
      });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: stage1.id,
        userId: user.id,
        campaignParticipationId: campaign2Participation2.id,
      });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: stage2.id,
        userId: user.id,
        campaignParticipationId: campaign2Participation2.id,
      });

      await databaseBuilder.commit();
    });

    it('should return campaign participations for a given user', async function () {
      // when
      const result = await usecases.findUserCampaignParticipationOverviews({
        userId: user.id,
      });

      // then
      expect(result.campaignParticipationOverviews.length).to.equal(2);
    });

    it('should return acquired stages', async function () {
      // when
      const result = await usecases.findUserCampaignParticipationOverviews({
        userId: user.id,
      });

      // then
      expect(result.campaignParticipationOverviews[0].totalStagesCount).to.equal(3);
      expect(result.campaignParticipationOverviews[0].validatedStagesCount).to.equal(1);
      expect(result.campaignParticipationOverviews[1].totalStagesCount).to.equal(3);
      expect(result.campaignParticipationOverviews[1].validatedStagesCount).to.equal(2);
    });
  });
});
