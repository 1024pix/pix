import { evaluationUsecases } from '../../domain/usecases/index.js';
import { KnowledgeElementDTO } from './models/KnowledgeElementDTO.js';

/**
 * @typedef KnowledgeElementDTO
 * @type {object}
 * @property {string} status
 */

/**
 * @typedef Payload
 * @type {object}
 * @property {number} userId
 * @property {Array<string>} skillIds
 */

/**
 * @function
 * @name findFilteredMostRecentByUser
 *
 * @param {Payload} payload
 * @returns {Promise<Array<KnowledgeElementDTO>>}
 */
export async function findFilteredMostRecentByUser({ userId, skillIds }) {
  const knowledgeElements = await evaluationUsecases.findFilteredMostRecentKnowledgeElementsByUser({
    userId,
    skillIds,
  });

  return knowledgeElements.map(_toApi);
}

const _toApi = (knowledgeElement) => new KnowledgeElementDTO(knowledgeElement);
