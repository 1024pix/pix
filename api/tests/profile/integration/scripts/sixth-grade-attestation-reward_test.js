import sinon from 'sinon';

import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import {
  fetchUserIds,
  PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS,
  SixthGradeAttestationRewardScript,
} from '../../../../src/profile/scripts/sixth-grade-attestation-reward.js';
import { catchErr, databaseBuilder, expect } from '../../../test-helper.js';

describe('Integration | Profile | Scripts | sixth-grade-attestation-reward', function () {
  describe('#fetchUsers', function () {
    it('should not return the user if the participation date is not included between the start date and the end date ', async function () {
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[0],
      });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-12-02',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-12-07',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-11-22',
      });

      await databaseBuilder.commit();
      const userIds = await fetchUserIds();
      expect(userIds).to.have.lengthOf(1);
      expect(userIds).to.contains(userId);
    });

    it('should not return the user if the participation status is different from started', async function () {
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[0],
      });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        createdAt: '2024-12-02',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-12-02',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-02',
      });

      await databaseBuilder.commit();
      const userIds = await fetchUserIds();
      expect(userIds).to.have.lengthOf(2);
      expect(userIds).to.not.contains(userId);
    });

    it('should not return the user if the campaign target profile is not included in targeted target profiles', async function () {
      const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[0],
      });
      const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[1],
      });
      const { id: targetProfileId3 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[2],
      });
      const { id: targetProfileId4 } = databaseBuilder.factory.buildTargetProfile();
      const campaign1 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId1 });
      const campaign2 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId2 });
      const campaign3 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId3 });
      const campaign4 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId4 });
      const otherParameters = { status: CampaignParticipationStatuses.SHARED, createdAt: '2024-12-02T15:07:57.376Z' };
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        ...otherParameters,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        ...otherParameters,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign3.id,
        ...otherParameters,
      });
      const { userId: otherTargetProfileCampaignParticipationUserId } =
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign4.id,
          ...otherParameters,
        });

      await databaseBuilder.commit();
      const userIds = await fetchUserIds();
      expect(userIds).to.have.lengthOf(3);
      expect(userIds).to.not.contains(otherTargetProfileCampaignParticipationUserId);
    });

    it('should return expected users', async function () {
      const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[0],
      });
      const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[1],
      });
      const { id: targetProfileId3 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[2],
      });
      const campaign1 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId1 });
      const campaign2 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId2 });
      const campaign3 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId3 });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-12-01',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-02',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign3.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-03',
      });

      await databaseBuilder.commit();
      const userIds = await fetchUserIds();
      expect(userIds).to.have.lengthOf(3);
    });
  });

  describe('#handle', function () {
    it('should log information for each userId', async function () {
      const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[0],
      });
      const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[1],
      });
      const { id: targetProfileId3 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[2],
      });
      const campaign1 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId1 });
      const campaign2 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId2 });
      const campaign3 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId3 });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-12-01',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-02',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign3.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-03',
      });

      await databaseBuilder.commit();

      const script = new SixthGradeAttestationRewardScript();
      const logger = { info: sinon.spy(), error: sinon.spy() };
      const usecases = { rewardUser: sinon.stub() };

      await script.handle({
        options: {},
        logger,
        rewardUser: usecases.rewardUser,
      });

      expect(logger.info.callCount).to.equal(5);
    });

    it('should use the provided limit dates to query user ids', async function () {
      const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[0],
      });
      const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[1],
      });
      const { id: targetProfileId3 } = databaseBuilder.factory.buildTargetProfile({
        id: PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS[2],
      });
      const campaign1 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId1 });
      const campaign2 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId2 });
      const campaign3 = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId3 });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-11-05',
      });
      const { userId: userId2 } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-05',
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign3.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: '2024-12-11',
      });

      await databaseBuilder.commit();

      const script = new SixthGradeAttestationRewardScript();
      const logger = { info: sinon.spy(), error: sinon.spy() };
      const usecases = { rewardUser: sinon.stub() };

      await script.handle({
        options: {
          startDate: '2024-12-01',
          endDate: '2024-12-08',
        },
        logger,
        rewardUser: usecases.rewardUser,
      });

      expect(usecases.rewardUser).to.have.been.calledOnceWithExactly({ userId: userId2 });
    });

    it('should throw an error if the limit date option is not in the correct format', async function () {
      const script = new SixthGradeAttestationRewardScript();
      const logger = { info: sinon.spy(), error: sinon.spy() };
      const usecases = { rewardUser: sinon.stub() };

      const error = await catchErr(script.handle)({
        options: {
          startDate: 'definitely not a date',
          endDate: { date: 'still not a date' },
        },
        logger,
        rewardUser: usecases.rewardUser,
      });

      expect(error).to.be.an.instanceOf(Error);
    });

    it('should throw an error if the time between the two time limits is greater than one week.', async function () {
      const script = new SixthGradeAttestationRewardScript();
      const logger = { info: sinon.spy(), error: sinon.spy() };
      const usecases = { rewardUser: sinon.stub() };

      const error = await catchErr(script.handle)({
        options: {
          startDate: '2024-11-01',
          endDate: '2024-11-09',
        },
        logger,
        rewardUser: usecases.rewardUser,
      });

      expect(error).to.be.an.instanceOf(Error);
    });

    it('should throw an error if endDate comes before startDate.', async function () {
      const script = new SixthGradeAttestationRewardScript();
      const logger = { info: sinon.spy(), error: sinon.spy() };
      const usecases = { rewardUser: sinon.stub() };

      const error = await catchErr(script.handle)({
        options: {
          startDate: '2024-11-10',
          endDate: '2024-11-09',
        },
        logger,
        rewardUser: usecases.rewardUser,
      });

      expect(error).to.be.an.instanceOf(Error);
    });
  });
});
