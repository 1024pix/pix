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

  const [targetProfile, tutorials] = await Promise.all([
    targetProfileWithLearningContentRepository.getByCampaignId({ campaignId }),
    tutorialRepository.list(),
  ]);

  const validatedKnowledgeElementsByTube = await knowledgeElementRepository
    .findValidatedTargetedGroupedByTubes({ [campaignParticipation.userId]: campaignParticipation.sharedAt }, targetProfile);

  return new CampaignAnalysis({
    campaignId,
    targetProfile,
    validatedKnowledgeElementsByTube,
    tutorials,
    participantsCount: 1,
  });
};
