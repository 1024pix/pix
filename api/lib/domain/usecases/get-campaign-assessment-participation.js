const { UserNotAuthorizedToAccessEntityError } = require('../errors.js');

module.exports = async function getCampaignAssessmentParticipation({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository,
  campaignAssessmentParticipationRepository,
  badgeAcquisitionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const campaignAssessmentParticipation =
    await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
      campaignId,
      campaignParticipationId,
    });

  const acquiredBadgesByCampaignParticipations =
    await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
      campaignParticipationsIds: [campaignParticipationId],
    });
  const badges = acquiredBadgesByCampaignParticipations[campaignAssessmentParticipation.campaignParticipationId];
  campaignAssessmentParticipation.setBadges(badges);

  return campaignAssessmentParticipation;
};
