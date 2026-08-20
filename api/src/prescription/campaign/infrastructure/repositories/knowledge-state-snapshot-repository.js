import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { KnowledgeState } from '../../../../shared/domain/models/KnowledgeState.js';
import {
  deserializeSnapshot,
  serializeKnowledgeState,
} from '../../../../shared/domain/services/knowledge-state-snapshot.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { CampaignParticipationKnowledgeState } from '../../../shared/domain/read-models/CampaignParticipationKnowledgeState.js';

const TABLE_NAME = 'knowledge-state-snapshots';

/**
 * Fige le profil d'une participation : l'état par tube, tel quel.
 *
 * @param {KnowledgeState} knowledgeState
 */
export async function save({ knowledgeState, campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const snapshot = JSON.stringify(serializeKnowledgeState(knowledgeState));
  const existingSnapshot = await knexConn
    .select('id')
    .from(TABLE_NAME)
    .where('campaignParticipationId', campaignParticipationId)
    .first();

  if (existingSnapshot) {
    return knexConn(TABLE_NAME).update('snapshot', snapshot).where('campaignParticipationId', campaignParticipationId);
  }

  return knexConn(TABLE_NAME).insert({
    snapshot,
    campaignParticipationId,
  });
}

/**
 * @param {number[]} campaignParticipationIds
 * @returns {Promise<Array<CampaignParticipationKnowledgeState>>}
 */
export async function findCampaignParticipationKnowledgeStates(campaignParticipationIds) {
  const knowledgeStateByCampaignParticipation = await findByCampaignParticipationIds(campaignParticipationIds);
  return campaignParticipationIds.map(
    (campaignParticipationId) =>
      new CampaignParticipationKnowledgeState({
        knowledgeState: knowledgeStateByCampaignParticipation[campaignParticipationId] ?? new KnowledgeState(),
        campaignParticipationId,
      }),
  );
}

/**
 * @param {number[]} campaignParticipationIds
 * @returns {Object.<number, KnowledgeState>}
 */
export async function findByCampaignParticipationIds(campaignParticipationIds) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select('campaignParticipationId', 'snapshot')
    .from(TABLE_NAME)
    .whereIn('campaignParticipationId', campaignParticipationIds);

  const allSkills = await skillRepository.list();

  return Object.fromEntries(
    results.map(({ campaignParticipationId, snapshot }) => [
      campaignParticipationId,
      deserializeSnapshot({ snapshot, allSkills }),
    ]),
  );
}
