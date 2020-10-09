const CampaignAnalysis = require('../models/CampaignAnalysis');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignAnalysis(
  {
    userId,
    campaignId,
    campaignParticipationRepository,
    campaignRepository,
    knowledgeElementRepository,
    targetProfileWithLearningContentRepository,
    tutorialRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const [tutorials, targetProfile, validatedKnowledgeElements, participantsCount] = await Promise.all([
    tutorialRepository.list(),
    targetProfileWithLearningContentRepository.getByCampaignId({ campaignId }),
    knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId),
    campaignParticipationRepository.countSharedParticipationOfCampaign(campaignId),
  ]);

  return new CampaignAnalysis({
    campaignId,
    targetProfile,
    validatedKnowledgeElements,
    participantsCount,
    tutorials,
  });
};
