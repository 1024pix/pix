import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as injectedAssessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedTargetProfileRepository from '../../../target-profile/infrastructure/repositories/target-profile-repository.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as injectedPoleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import { PoleEmploiSending } from '../models/PoleEmploiSending.js';

const sendCompletedParticipationResultsToPoleEmploi = async ({
  campaignParticipationId,
  assessmentRepository = injectedAssessmentRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  campaignRepository = injectedCampaignRepository,
  organizationRepository = injectedOrganizationRepository,
  poleEmploiSendingRepository = injectedPoleEmploiSendingRepository,
  targetProfileRepository = injectedTargetProfileRepository,
  userRepository = injectedUserRepository,
} = {}) => {
  if (!campaignParticipationId) return;

  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment && organization.isPoleEmploi) {
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const assessment = await assessmentRepository.get(participation.lastAssessment.id);

    const payload = PoleEmploiPayload.buildForParticipationFinished({
      user,
      campaign,
      targetProfile,
      participation,
      assessment,
    });

    const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
      campaignParticipationId,
      payload: payload.toString(),
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
};

export { sendCompletedParticipationResultsToPoleEmploi };
