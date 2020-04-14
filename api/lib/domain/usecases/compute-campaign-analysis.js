const _ = require('lodash');
const CampaignAnalysis = require('../models/CampaignAnalysis');
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
    campaignParticipationRepository
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const [competences, tubes, targetProfile, validatedKnowledgeElements, participantsCount] = await Promise.all([
    competenceRepository.list(),
    tubeRepository.list(),
    targetProfileRepository.getByCampaignId(campaignId),
    knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId),
    campaignParticipationRepository.countSharedParticipationOfCampaign(campaignId)
  ]);

  const targetedTubeIds = _.map(targetProfile.skills, ({ tubeId }) => ({ id: tubeId }));
  const targetedTubes = _.intersectionBy(tubes, targetedTubeIds, 'id');

  return new CampaignAnalysis({
    campaignId,
    tubes: targetedTubes,
    competences,
    skills: targetProfile.skills,
    validatedKnowledgeElements,
    participantsCount
  });
};
