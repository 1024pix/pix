import * as injectedBadgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as injectedBadgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedTargetProfileRepository from '../../../target-profile/infrastructure/repositories/target-profile-repository.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { campaignParticipationResultRepository as injectedCampaignParticipationResultRepository } from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import * as injectedPoleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import { PoleEmploiSending } from '../models/PoleEmploiSending.js';

const sendSharedParticipationResultsToPoleEmploi = async ({
  campaignParticipationId,
  badgeRepository = injectedBadgeRepository,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  campaignParticipationResultRepository = injectedCampaignParticipationResultRepository,
  campaignRepository = injectedCampaignRepository,
  organizationRepository = injectedOrganizationRepository,
  poleEmploiSendingRepository = injectedPoleEmploiSendingRepository,
  targetProfileRepository = injectedTargetProfileRepository,
  userRepository = injectedUserRepository,
} = {}) => {
  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment && organization.isPoleEmploi) {
    const badges = await badgeRepository.findByCampaignId(participation.campaignId);
    const badgeAcquiredIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
      badgeIds: badges.map((badge) => badge.id),
      userId: participation.userId,
    });
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const participationResult =
      await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId);

    const payload = PoleEmploiPayload.buildForParticipationShared({
      user,
      campaign,
      targetProfile,
      participation,
      participationResult,
      badges,
      badgeAcquiredIds,
    });

    const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
      campaignParticipationId,
      payload: payload.toString(),
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
};

export { sendSharedParticipationResultsToPoleEmploi };
