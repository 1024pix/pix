const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const CampaignCollectiveResult = require('../../domain/read-models/CampaignCollectiveResult');
const knowledgeElementRepository = require('./knowledge-element-repository');
const constants = require('../constants');

module.exports = {

  async getCampaignCollectiveResult(campaignId, targetProfileWithLearningContent) {
    const campaignCollectiveResult = new CampaignCollectiveResult({ id: campaignId, targetProfile: targetProfileWithLearningContent });

    const userIdsAndSharedDatesChunks = await _getChunksSharedParticipationsWithUserIdsAndDates(campaignId);

    let participantCount = 0;
    await bluebird.mapSeries(userIdsAndSharedDatesChunks, async (userIdsAndSharedDates) => {
      participantCount += userIdsAndSharedDates.length;
      const validatedTargetedKnowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers(Object.fromEntries(userIdsAndSharedDates), targetProfileWithLearningContent);
      campaignCollectiveResult.addValidatedSkillCountToCompetences(validatedTargetedKnowledgeElementsCountByCompetenceId);
    });

    campaignCollectiveResult.finalize(participantCount);
    return campaignCollectiveResult;
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
