const { UserNotAuthorizedToAccessEntityError, CampaignParticipationDeletedError } = require('../errors');

module.exports = async function computeCampaignParticipationAnalysis({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  campaignRepository,
  campaignAnalysisRepository,
  learningContentRepository,
  tutorialRepository,
  locale,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaignId = campaignParticipation.campaignId;
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  if (campaignParticipation.deletedAt !== null) {
    throw new CampaignParticipationDeletedError('Cannot access deleted campaign participation');
  }

  if (!campaignParticipation.isShared) {
    return null;
  }

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignParticipationAnalysis(
    campaignId,
    campaignParticipation,
    learningContent,
    tutorials
  );
};
