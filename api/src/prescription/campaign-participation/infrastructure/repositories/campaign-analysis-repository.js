import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../../../../src/shared/infrastructure/constants.js';
import { CampaignAnalysis } from '../../../campaign/domain/read-models/CampaignAnalysis.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

const { SHARED } = CampaignParticipationStatuses;

const getCampaignAnalysis = async function (campaignId, campaignLearningContent, tutorials) {
  const userIdsAndSharedDates = await _getSharedParticipationsWithUserIdsAndDates(campaignId);
  const userIdsAndSharedDatesChunks = _.chunk(userIdsAndSharedDates, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  const participantCount = userIdsAndSharedDates.length;

  const campaignAnalysis = new CampaignAnalysis({
    campaignId,
    campaignLearningContent,
    tutorials,
    participantCount,
  });

  for (const userIdsAndSharedDates of userIdsAndSharedDatesChunks) {
    const knowledgeElementsByTube = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
      Object.fromEntries(userIdsAndSharedDates),
      campaignLearningContent,
    );
    campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });
  }

  campaignAnalysis.finalize();
  return campaignAnalysis;
};

const getCampaignParticipationAnalysis = async function (
  campaignId,
  campaignParticipation,
  campaignLearningContent,
  tutorials,
) {
  const campaignAnalysis = new CampaignAnalysis({
    campaignId,
    campaignLearningContent,
    tutorials,
    participantCount: 1,
  });

  const knowledgeElementsByTube = await knowledgeElementRepository.findValidatedGroupedByTubesWithinCampaign(
    { [campaignParticipation.userId]: campaignParticipation.sharedAt },
    campaignLearningContent,
  );
  campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });

  campaignAnalysis.finalize(1);
  return campaignAnalysis;
};

export { getCampaignAnalysis, getCampaignParticipationAnalysis };

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
