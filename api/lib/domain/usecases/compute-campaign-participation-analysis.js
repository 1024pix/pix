const _ = require('lodash');
const CampaignAnalysis = require('../models/CampaignAnalysis');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignParticipationAnalysis(
  {
    userId,
    campaignParticipationId,
    campaignRepository,
    campaignParticipationRepository,
    competenceRepository,
    targetProfileRepository,
    tubeRepository,
    knowledgeElementRepository,
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

  const [competences, tubes, targetProfile, validatedKnowledgeElements] = await Promise.all([
    competenceRepository.list(),
    tubeRepository.list(),
    targetProfileRepository.getByCampaignId(campaignId),
    knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId: campaignParticipation.userId }),
  ]);

  const targetedTubeIds = _.map(targetProfile.skills, ({ tubeId }) => ({ id: tubeId }));
  const targetedTubes = _.intersectionBy(tubes, targetedTubeIds, 'id');

  return new CampaignAnalysis({
    campaignId,
    tubes: targetedTubes,
    competences,
    skills: targetProfile.skills,
    validatedKnowledgeElements,
    participantsCount: 1
  });
};
