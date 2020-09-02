const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignAssessmentParticipation({ userId, campaignId, campaignParticipationId, campaignRepository, campaignAssessmentParticipationRepository }) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to the organization that owns the campaign');
  }

  return campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId });
};
