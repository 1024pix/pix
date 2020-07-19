const _ = require('lodash');
const CampaignAnalysisV2 = require('../models/CampaignAnalysisV2');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignAnalysis(
  {
    userId,
    campaignId,
    campaignRepository,
    competenceRepository,
    targetProfileRepository,
    tubeRepository,
    knowledgeElementRepository,
    campaignParticipationRepository,
    tutorialRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const [competences, tubes, tutorials, targetProfile, sharedParticipations] = await Promise.all([
    competenceRepository.list(),
    tubeRepository.list(),
    tutorialRepository.list(),
    targetProfileRepository.getByCampaignId(campaignId),
    campaignParticipationRepository.findSharedParticipationOfCampaign(campaignId),
  ]);
  const targetedTubeIds = _.map(targetProfile.skills, ({ tubeId }) => ({ id: tubeId }));
  const targetedTubes = _.intersectionBy(tubes, targetedTubeIds, 'id');
  const campaignAnalysis = new CampaignAnalysisV2({
    campaignId,
    tubes: targetedTubes,
    competences,
    skills: targetProfile.skills,
    tutorials,
  });

  for (const sharedParticipation of sharedParticipations) {
    const knowledgeElementsForParticipant = await knowledgeElementRepository.findUniqByUserId({ userId: sharedParticipation.userId , limitDate: sharedParticipation.sharedAt });
    const validatedKnowledgeElementsForParticipant = _.filter(knowledgeElementsForParticipant, (knowledgeElement) => knowledgeElement.isValidated);
    campaignAnalysis.updateCampaignTubeRecommendations({ [sharedParticipation.userId]: validatedKnowledgeElementsForParticipant });
  }

  return campaignAnalysis;
};
