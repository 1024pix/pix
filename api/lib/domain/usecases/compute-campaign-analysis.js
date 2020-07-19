const _ = require('lodash');
const bluebird = require('bluebird');
const CampaignAnalysisV2 = require('../models/CampaignAnalysisV2');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const constants = require('../../infrastructure/constants');

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

  const sharedParticipationsChunks = _.chunk(sharedParticipations, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  await bluebird.mapSeries(sharedParticipationsChunks, async (sharedParticipationsChunk) => {
    const userIdsAndDates = Object.fromEntries(sharedParticipationsChunk.map((sharedParticipation) => {
      return [
        sharedParticipation.userId,
        sharedParticipation.sharedAt,
      ];
    }));

    const knowledgeElementsByUserId =
      await knowledgeElementRepository.findByUserIdsAndDatesGroupedByUserIdWithSnapshotting(userIdsAndDates);

    const validatedKnowledgeElementsByParticipant = _.mapValues(knowledgeElementsByUserId, (knowledgeElements) => {
      return _.filter(knowledgeElements, (knowledgeElement) => knowledgeElement.isValidated);
    });
    campaignAnalysis.updateCampaignTubeRecommendations(validatedKnowledgeElementsByParticipant);
  });

  return campaignAnalysis;
};
