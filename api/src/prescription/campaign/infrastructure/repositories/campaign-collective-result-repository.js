import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../../../shared/infrastructure/constants.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignCollectiveResult } from '../../domain/read-models/CampaignCollectiveResult.js';
import * as knowledgeElementSnapshotRepository from './knowledge-element-snapshot-repository.js';
const { SHARED } = CampaignParticipationStatuses;

const getCampaignCollectiveResult = async function (campaignId, campaignLearningContent) {
  const campaignCollectiveResult = new CampaignCollectiveResult({
    id: campaignId,
    campaignLearningContent,
  });

  const sharedCampaignParticipationIdsChunks = await _getChunksSharedParticipations(campaignId);
  let participantCount = 0;
  for (const campaignParticipationIds of sharedCampaignParticipationIdsChunks) {
    participantCount += campaignParticipationIds.length;
    const knowledgeElementsGroupedByCampaignParticipationId =
      await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(campaignParticipationIds);
    const knowledgeElements = Object.values(knowledgeElementsGroupedByCampaignParticipationId).flat();
    const validatedTargetedKnowledgeElementsCountByCompetenceId =
      campaignLearningContent.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);
    campaignCollectiveResult.addValidatedSkillCountToCompetences(validatedTargetedKnowledgeElementsCountByCompetenceId);
  }

  campaignCollectiveResult.finalize(participantCount);
  return campaignCollectiveResult;
};

export { getCampaignCollectiveResult };

async function _getChunksSharedParticipations(campaignId) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .from('campaign-participations')
    .max('id')
    .where({ campaignId, status: SHARED, deletedAt: null })
    .groupBy('userId', 'organizationLearnerId');

  const ids = results.map(({ max }) => max);
  return _.chunk(ids, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
}
