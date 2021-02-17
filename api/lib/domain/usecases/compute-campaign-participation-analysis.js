const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function computeCampaignParticipationAnalysis({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  campaignRepository,
  campaignAnalysisRepository,
  targetProfileWithLearningContentRepository,
  tutorialRepository,
  locale,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaignId = campaignParticipation.campaignId;
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
  }

  if (!campaignParticipation.isShared) {
    return null;
  }

  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId, locale });
  const tutorials = await tutorialRepository.list({ locale });

  return campaignAnalysisRepository.getCampaignParticipationAnalysis(campaignId, campaignParticipation, targetProfileWithLearningContent, tutorials);
};
