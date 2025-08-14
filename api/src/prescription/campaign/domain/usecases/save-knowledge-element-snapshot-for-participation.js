import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedKnowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';

export const saveKnowledgeElementSnapshotForParticipation = withTransaction(async function ({
  knowledgeElementCollection,
  campaignParticipationId,
  knowledgeElementSnapshotRepository = injectedKnowledgeElementSnapshotRepository,
} = {}) {
  await knowledgeElementSnapshotRepository.save({
    snapshot: knowledgeElementCollection.toSnapshot(),
    campaignParticipationId,
  });

  const knowledgeElementSnapshotForParticipations =
    await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([campaignParticipationId]);
  return knowledgeElementSnapshotForParticipations?.[campaignParticipationId];
});
