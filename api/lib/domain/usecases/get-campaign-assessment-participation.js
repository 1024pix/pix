const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function getCampaignAssessmentParticipation({ userId, campaignId, campaignParticipationId, campaignRepository, campaignAssessmentParticipationRepository, badgeAcquisitionRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const campaignAssessmentParticipation = await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });

  const acquiredBadgesByUser = await badgeAcquisitionRepository.getCampaignAcquiredBadgesByUsers({ campaignId, userIds: [campaignAssessmentParticipation.userId] });
  const badges = acquiredBadgesByUser[campaignAssessmentParticipation.userId];
  campaignAssessmentParticipation.setBadges(badges);

  return campaignAssessmentParticipation;
};
