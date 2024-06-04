import * as httpErrorsHelper from '../../../../../lib/infrastructure/http/errors-helper.js';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';
import * as monitoringTools from '../../../../../lib/infrastructure/monitoring-tools.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/PoleEmploiPayload.js';
import { PoleEmploiSending } from '../models/PoleEmploiSending.js';

const sendSharedParticipationResultsToPoleEmploi = async ({
  campaignParticipationId,
  authenticationMethodRepository,
  badgeRepository,
  badgeAcquisitionRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignRepository,
  organizationRepository,
  poleEmploiNotifier,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
  notifierDependencies = {
    httpAgent,
    httpErrorsHelper,
    monitoringTools,
  },
}) => {
  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {
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

    const response = await poleEmploiNotifier.notify(user.id, payload, {
      authenticationMethodRepository,
      ...notifierDependencies,
    });

    const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
};

export { sendSharedParticipationResultsToPoleEmploi };
