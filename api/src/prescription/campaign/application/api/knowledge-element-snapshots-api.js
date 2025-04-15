import { KnowledgeElementCollection } from '../../../shared/domain/models/KnowledgeElementCollection.js';
import { usecases } from '../../domain/usecases/index.js';
import { KnowledgeElementSnapshot } from './models/KnowledgeElementSnapshot.js';
/**
 * @module KnowledgeElementSnapshotAPI
 */

/**
 * @typedef KnowledgeElementSnapshotPayload
 * @type {object}
 * @property {number} userId
 * @property {number} campaignParticipationId
 * @property {Array<KnowledgeElement>} knowledgeElements
 */

/**
 * @function
 * @name save
 *
 * @param {KnowledgeElementSnapshotPayload} knowledgeElementSnapshotPayload
 * @returns {Promise<Boolean>}
 */
export async function save(knowledgeElementSnapshotPayload) {
  await usecases.saveKnowledgeElementSnapshotForParticipation({
    knowledgeElementCollection: new KnowledgeElementCollection(knowledgeElementSnapshotPayload.knowledgeElements),
    campaignParticipationId: knowledgeElementSnapshotPayload.campaignParticipationId,
  });

  return true;
}

/**
 * @function
 * @name getByParticipation
 *
 * @param {number} campaignParticipationId
 * @returns {Promise<KnowledgeElementSnapshot|null>}
 */
export async function getByParticipation(campaignParticipationId) {
  const knowledgeElements = await usecases.getKnowledgeElementSnapshotForParticipation({
    campaignParticipationId,
  });
  return new KnowledgeElementSnapshot({
    knowledgeElements,
    campaignParticipationId,
  });
}
