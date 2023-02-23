const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js');
const PoleEmploiSending = require('../models/PoleEmploiSending.js');

module.exports = async function sendSharedParticipationResultsToPoleEmploi({
  badgeRepository,
  badgeAcquisitionRepository,
  campaignParticipationId,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignRepository,
  organizationRepository,
  poleEmploiNotifier,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
}) {
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
    const participationResult = await campaignParticipationResultRepository.getByParticipationId(
      campaignParticipationId
    );

    const payload = PoleEmploiPayload.buildForParticipationShared({
      user,
      campaign,
      targetProfile,
      participation,
      participationResult,
      badges,
      badgeAcquiredIds,
    });

    const response = await poleEmploiNotifier.notify(user.id, payload);

    const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
};
