const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignAssessmentParticipationResult(
  {
    userId,
    campaignId,
    campaignParticipationId,
    campaignRepository,
    campaignAssessmentParticipationResultRepository,
    locale,
  } = {}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to the organization that owns the campaign');
  }

  return campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId, locale });
};
