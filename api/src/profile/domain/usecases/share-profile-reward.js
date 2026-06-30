import { ProfileRewardCantBeSharedError } from '../errors.js';

export const shareProfileReward = async function ({
  userId,
  profileRewardId,
  campaignParticipationId,
  organizationId,
  profileRewardRepository,
  organizationProfileRewardRepository,
  campaignParticipationRepository,
}) {
  const profileReward = await profileRewardRepository.getById({ profileRewardId });

  if (profileReward?.userId !== userId) {
    throw new ProfileRewardCantBeSharedError();
  }

  if (campaignParticipationId) {
    organizationId = await campaignParticipationRepository.getCampaignByParticipationId({ campaignParticipationId })
      .organizationId;
  }

  await organizationProfileRewardRepository.save({
    organizationId,
    profileRewardId,
  });
};
