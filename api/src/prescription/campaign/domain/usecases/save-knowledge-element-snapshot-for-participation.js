import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

export const saveKnowledgeElementSnapshotForParticipation = withTransaction(async function ({
  knowledgeElementCollection,
  campaignParticipationId,
  knowledgeElementSnapshotRepository,
}) {
  await knowledgeElementSnapshotRepository.save({
    snapshot: knowledgeElementCollection.toSnapshot(),
    campaignParticipationId,
  });

  const knowledgeElementSnapshotForParticipations =
    await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([campaignParticipationId]);
  return knowledgeElementSnapshotForParticipations?.[campaignParticipationId];
});
