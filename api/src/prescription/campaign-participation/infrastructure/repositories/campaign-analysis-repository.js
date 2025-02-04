import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../../../../src/shared/infrastructure/constants.js';
import { CampaignAnalysis } from '../../../campaign/domain/read-models/CampaignAnalysis.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
const { SHARED } = CampaignParticipationStatuses;

const getCampaignAnalysis = async function (campaignId, campaignLearningContent, tutorials) {
  const campaignParticipationIds = await _getSharedParticipationsId(campaignId);
  const campaignParticipationIdsChunks = _.chunk(campaignParticipationIds, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  const participantCount = campaignParticipationIds.length;

  const campaignAnalysis = new CampaignAnalysis({
    campaignId,
    campaignLearningContent,
    tutorials,
    participantCount,
  });

  for (const campaignParticipationIdChunk of campaignParticipationIdsChunks) {
    const knowledgeElementsByParticipation =
      await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(campaignParticipationIdChunk);

    const knowledgeElementsByTube = campaignLearningContent.getValidatedKnowledgeElementsGroupedByTube(
      Object.values(knowledgeElementsByParticipation).flat(),
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

  const snapshot = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([campaignParticipation.id]);

  const knowledgeElementsByTube = campaignLearningContent.getValidatedKnowledgeElementsGroupedByTube(
    snapshot[campaignParticipation.id],
  );
  campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });

  campaignAnalysis.finalize(1);
  return campaignAnalysis;
};

export { getCampaignAnalysis, getCampaignParticipationAnalysis };

async function _getSharedParticipationsId(campaignId) {
  const results = await knex('campaign-participations')
    .pluck('id')
    .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null });

  return results;
}
