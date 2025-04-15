import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';
import { CampaignParticipationKnowledgeElementSnapshots } from '../../../shared/domain/read-models/CampaignParticipationKnowledgeElementSnapshots.js';

export async function save({ snapshot, campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const existingSnapshot = await knexConn
    .select('id')
    .from('knowledge-element-snapshots')
    .where('campaignParticipationId', campaignParticipationId)
    .first();
  if (existingSnapshot) {
    return await knexConn('knowledge-element-snapshots')
      .update({
        snapshot,
      })
      .where('campaignParticipationId', campaignParticipationId);
  } else {
    return await knexConn('knowledge-element-snapshots').insert({
      snapshot,
      campaignParticipationId,
    });
  }
}

/**
 * @function
 * @name findCampaignParticipationKnowledgeElementSnapshots
 *
 * @param {number[]} campaignParticipationIds
 * @returns {Promise<Array<CampaignParticipationKnowledgeElementSnapshots>>}
 */
export async function findCampaignParticipationKnowledgeElementSnapshots(campaignParticipationIds) {
  const knowledgeElementsByCampaignParticipation = await findByCampaignParticipationIds(campaignParticipationIds);
  return campaignParticipationIds.map(
    (campaignParticipationId) =>
      new CampaignParticipationKnowledgeElementSnapshots({
        knowledgeElements: knowledgeElementsByCampaignParticipation[campaignParticipationId],
        campaignParticipationId: campaignParticipationId,
      }),
  );
}

/**
 *
 * @param {number[]} campaignParticipationIds
 * @returns {Object.<number, KnowledgeElement[]>}
 */
export async function findByCampaignParticipationIds(campaignParticipationIds) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select('campaignParticipationId', 'snapshot')
    .from('knowledge-element-snapshots')
    .whereIn('campaignParticipationId', campaignParticipationIds);

  return Object.fromEntries(
    results.map(({ campaignParticipationId, snapshot }) => [
      campaignParticipationId,
      snapshot.map(({ createdAt, ...data }) => {
        return new KnowledgeElement({ ...data, createdAt: new Date(createdAt) });
      }),
    ]),
  );
}
