const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const knowledgeElementRepository = require('./knowledge-element-repository');
const CampaignAnalysis = require('../../domain/read-models/CampaignAnalysis');
const constants = require('../constants');

module.exports = {

  async getCampaignAnalysis(campaignId, targetProfile, tutorials) {
    const campaignAnalysis = new CampaignAnalysis({ campaignId, targetProfile, tutorials });
    const userIdsAndSharedDatesChunks = await _getChunksSharedParticipationsWithUserIdsAndDates(campaignId);

    let participantCount = 0;
    await bluebird.mapSeries(userIdsAndSharedDatesChunks, async (userIdsAndSharedDates) => {
      participantCount += userIdsAndSharedDates.length;
      const validatedKnowledgeElementsByTube =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes(Object.fromEntries(userIdsAndSharedDates), targetProfile);
      campaignAnalysis.addValidatedKnowledgeElementsToTubeRecommendations(validatedKnowledgeElementsByTube);
    });
    campaignAnalysis.finalize(participantCount);
    return campaignAnalysis;
  },
};

async function _getChunksSharedParticipationsWithUserIdsAndDates(campaignId) {
  const results = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, isShared: true });

  const userIdsAndDates = [];
  for (const result of results) {
    userIdsAndDates.push([result.userId, result.sharedAt]);
  }

  return _.chunk(userIdsAndDates, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
}
