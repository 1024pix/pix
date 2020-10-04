const CampaignAnalysis = require('../models/CampaignAnalysis');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignParticipationAnalysis(
  {
    userId,
    campaignParticipationId,
    campaignParticipationRepository,
    campaignRepository,
    knowledgeElementRepository,
    targetProfileWithLearningContentRepository,
    tutorialRepository,
  } = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaignId = campaignParticipation.campaignId;
  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  if (!campaignParticipation.isShared)  {
    return null;
  }

  const [targetProfile, validatedKnowledgeElements, tutorials] = await Promise.all([
    targetProfileWithLearningContentRepository.getByCampaignId({ campaignId }),
    knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId: campaignParticipation.userId }),
    tutorialRepository.list(),
  ]);

  return new CampaignAnalysis({
    campaignId,
    targetProfile,
    validatedKnowledgeElements,
    tutorials,
    participantsCount: 1,
  });
};
