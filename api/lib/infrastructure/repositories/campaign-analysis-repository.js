const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../../../db/knex-database-connection');
const knowledgeElementRepository = require('./knowledge-element-repository');
const CampaignAnalysis = require('../../domain/read-models/CampaignAnalysis');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');
const constants = require('../constants');

const { SHARED } = CampaignParticipationStatuses;

module.exports = {
  async getCampaignAnalysis(campaignId, campaignLearningContent, tutorials) {
    const userIdsAndSharedDates = await _getSharedParticipationsWithUserIdsAndDates(campaignId);
    const userIdsAndSharedDatesChunks = _.chunk(userIdsAndSharedDates, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
    const participantCount = userIdsAndSharedDates.length;

    const campaignAnalysis = new CampaignAnalysis({
      campaignId,
      campaignLearningContent,
      tutorials,
      participantCount,
    });

    await bluebird.mapSeries(userIdsAndSharedDatesChunks, async (userIdsAndSharedDates) => {
      const knowledgeElementsByTube = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
        Object.fromEntries(userIdsAndSharedDates),
        campaignLearningContent
      );
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });
    });
    campaignAnalysis.finalize();
    return campaignAnalysis;
  },

  async getCampaignParticipationAnalysis(campaignId, campaignParticipation, campaignLearningContent, tutorials) {
    const campaignAnalysis = new CampaignAnalysis({
      campaignId,
      campaignLearningContent,
      tutorials,
      participantCount: 1,
    });

    const knowledgeElementsByTube = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
      { [campaignParticipation.userId]: campaignParticipation.sharedAt },
      campaignLearningContent
    );
    campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });

    campaignAnalysis.finalize(1);
    return campaignAnalysis;
  },
};

async function _getSharedParticipationsWithUserIdsAndDates(campaignId) {
  const results = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null });

  const userIdsAndDates = [];
  for (const result of results) {
    userIdsAndDates.push([result.userId, result.sharedAt]);
  }

  return userIdsAndDates;
}
