import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../../../../shared/infrastructure/constants.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignCollectiveResult } from '../../domain/read-models/CampaignCollectiveResult.js';
import { getLatestParticipationSharedForOneLearner } from './helpers/get-latest-participation-shared-for-one-learner.js';

const { SHARED } = CampaignParticipationStatuses;

const getCampaignCollectiveResult = async function (campaignId, campaignLearningContent) {
  const campaignCollectiveResult = new CampaignCollectiveResult({
    id: campaignId,
    campaignLearningContent,
  });

  const userIdsAndSharedDatesChunks = await _getChunksSharedParticipationsWithUserIdsAndDates(campaignId);

  let participantCount = 0;
  for (const userIdsAndSharedDates of userIdsAndSharedDatesChunks) {
    participantCount += userIdsAndSharedDates.length;
    const knowledgeElementsGroupedByUser = await knowledgeElementRepository.findSnapshotForUsers(
      Object.fromEntries(userIdsAndSharedDates),
    );
    const knowledgeElements = Object.values(knowledgeElementsGroupedByUser).flat();
    const validatedTargetedKnowledgeElementsCountByCompetenceId =
      campaignLearningContent.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);
    campaignCollectiveResult.addValidatedSkillCountToCompetences(validatedTargetedKnowledgeElementsCountByCompetenceId);
  }

  campaignCollectiveResult.finalize(participantCount);
  return campaignCollectiveResult;
};

export { getCampaignCollectiveResult };

async function _getChunksSharedParticipationsWithUserIdsAndDates(campaignId) {
  const results = await knex
    .from('campaign-participations as cp')
    .select([
      getLatestParticipationSharedForOneLearner(knex, 'sharedAt', campaignId),
      'userId',
      'organizationLearnerId',
    ])
    .where({ campaignId, status: SHARED, deletedAt: null })
    .groupBy('userId', 'organizationLearnerId');

  const userIdsAndDates = results.map((result) => [result.userId, result.sharedAt]);

  return _.chunk(userIdsAndDates, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
}
