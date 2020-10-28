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

  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });
  const tutorials = await tutorialRepository.list();
  const sharedParticipationsUserIdsAndDates = await campaignParticipationRepository.findSharedParticipationsWithUserIdsAndDates(campaignId);

  const validatedKnowledgeElementsByTube = await knowledgeElementRepository.findValidatedTargetedGroupedByTubes(sharedParticipationsUserIdsAndDates, targetProfile);

  return new CampaignAnalysis({
    campaignId,
    targetProfile,
    validatedKnowledgeElementsByTube,
    participantsCount: Object.keys(sharedParticipationsUserIdsAndDates).length,
    tutorials,
  });
};
