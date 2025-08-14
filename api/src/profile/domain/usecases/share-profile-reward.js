import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as injectedOrganizationProfileRewardRepository from '../../infrastructure/repositories/organizations-profile-reward-repository.js';
import * as injectedProfileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
import { ProfileRewardCantBeSharedError } from '../errors.js';

export const shareProfileReward = async function ({
  userId,
  profileRewardId,
  campaignParticipationId,
  profileRewardRepository = injectedProfileRewardRepository,
  organizationProfileRewardRepository = injectedOrganizationProfileRewardRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  const profileReward = await profileRewardRepository.getById({ profileRewardId });

  if (profileReward?.userId !== userId) {
    throw new ProfileRewardCantBeSharedError();
  }

  const campaign = await campaignParticipationRepository.getCampaignByParticipationId({ campaignParticipationId });

  await organizationProfileRewardRepository.save({
    organizationId: campaign.organizationId,
    profileRewardId,
  });
};
