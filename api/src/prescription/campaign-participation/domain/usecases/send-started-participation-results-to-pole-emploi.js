import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedTargetProfileRepository from '../../../target-profile/infrastructure/repositories/target-profile-repository.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as injectedPoleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import { PoleEmploiSending } from '../models/PoleEmploiSending.js';

const sendStartedParticipationResultsToPoleEmploi = async ({
  campaignParticipationId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
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
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const payload = PoleEmploiPayload.buildForParticipationStarted({
      user,
      campaign,
      targetProfile,
      participation,
    });

    const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
      campaignParticipationId,
      payload: payload.toString(),
    });

    await poleEmploiSendingRepository.create({ poleEmploiSending });
  }
};

export { sendStartedParticipationResultsToPoleEmploi };
