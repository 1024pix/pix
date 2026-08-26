import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../domain/constants.js';
import { CampaignCollectiveResult } from '../../domain/read-models/CampaignCollectiveResult.js';
import * as knowledgeStateSnapshotRepository from './knowledge-state-snapshot-repository.js';
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
    const knowledgeStatesByCampaignParticipationId =
      await knowledgeStateSnapshotRepository.findByCampaignParticipationIds(campaignParticipationIds);
    const validatedSkillIds = Object.values(knowledgeStatesByCampaignParticipationId).flatMap((knowledgeState) =>
      knowledgeState.validatedSkills().map(({ id }) => id),
    );
    const validatedTargetedSkillsCountByCompetenceId =
      campaignLearningContent.countTargetedSkillsByCompetence(validatedSkillIds);
    campaignCollectiveResult.addValidatedSkillCountToCompetences(validatedTargetedSkillsCountByCompetenceId);
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
