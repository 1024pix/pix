const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../../../db/knex-database-connection');
const CampaignCollectiveResult = require('../../domain/read-models/CampaignCollectiveResult');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');
const knowledgeElementRepository = require('./knowledge-element-repository');
const constants = require('../constants');

const { SHARED } = CampaignParticipationStatuses;

module.exports = {
  async getCampaignCollectiveResult(campaignId, campaignLearningContent) {
    const campaignCollectiveResult = new CampaignCollectiveResult({
      id: campaignId,
      campaignLearningContent,
    });

    const userIdsAndSharedDatesChunks = await _getChunksSharedParticipationsWithUserIdsAndDates(campaignId);

    let participantCount = 0;
    await bluebird.mapSeries(userIdsAndSharedDatesChunks, async (userIdsAndSharedDates) => {
      participantCount += userIdsAndSharedDates.length;
      const validatedTargetedKnowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedByCompetencesForUsersWithinCampaign(
          Object.fromEntries(userIdsAndSharedDates),
          campaignLearningContent
        );
      campaignCollectiveResult.addValidatedSkillCountToCompetences(
        validatedTargetedKnowledgeElementsCountByCompetenceId
      );
    });

    campaignCollectiveResult.finalize(participantCount);
    return campaignCollectiveResult;
  },
};

async function _getChunksSharedParticipationsWithUserIdsAndDates(campaignId) {
  const results = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null });

  const userIdsAndDates = results.map((result) => [result.userId, result.sharedAt]);

  return _.chunk(userIdsAndDates, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
}
