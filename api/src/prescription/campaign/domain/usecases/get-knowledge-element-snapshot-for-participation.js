import * as injectedKnowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';
export async function getKnowledgeElementSnapshotForParticipation({
  campaignParticipationId,
  knowledgeElementSnapshotRepository = injectedKnowledgeElementSnapshotRepository,
} = {}) {
  const knowledgeElementSnapshotForParticipations =
    await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([campaignParticipationId]);
  return knowledgeElementSnapshotForParticipations?.[campaignParticipationId] ?? null;
}
