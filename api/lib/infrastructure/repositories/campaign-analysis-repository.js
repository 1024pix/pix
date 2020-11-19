const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const knowledgeElementRepository = require('./knowledge-element-repository');
const CampaignAnalysis = require('../../domain/read-models/CampaignAnalysis');
const constants = require('../constants');

module.exports = {

  async getCampaignAnalysis(campaignId, targetProfileWithLearningContent, tutorials) {
    const userIdsAndSharedDates = await _getSharedParticipationsWithUserIdsAndDates(campaignId);
    const userIdsAndSharedDatesChunks = _.chunk(userIdsAndSharedDates, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
    const participantCount = userIdsAndSharedDates.length;

    const campaignAnalysis = new CampaignAnalysis({ campaignId, targetProfileWithLearningContent, tutorials, participantCount });

    await bluebird.mapSeries(userIdsAndSharedDatesChunks, async (userIdsAndSharedDates) => {
      const knowledgeElementsByTube =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes(Object.fromEntries(userIdsAndSharedDates), targetProfileWithLearningContent);
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });
    });
    campaignAnalysis.finalize();
    return campaignAnalysis;
  },

  async getCampaignParticipationAnalysis(campaignId, campaignParticipation, targetProfileWithLearningContent, tutorials) {
    const campaignAnalysis = new CampaignAnalysis({ campaignId, targetProfileWithLearningContent, tutorials, participantCount: 1 });

    const knowledgeElementsByTube =
      await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [campaignParticipation.userId]: campaignParticipation.sharedAt }, targetProfileWithLearningContent);
    campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });

    campaignAnalysis.finalize(1);
    return campaignAnalysis;
  },
};

async function _getSharedParticipationsWithUserIdsAndDates(campaignId) {
  const results = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, isShared: true });

  const userIdsAndDates = [];
  for (const result of results) {
    userIdsAndDates.push([result.userId, result.sharedAt]);
  }

  return userIdsAndDates;
}
