import * as readChallengeRepository from '../../infrastructure/repositories/read-challenge-repository.js';

/**
 * @typedef BaseChallenge
 * @type {object}
 * @property {string} id
 */

/**
 * @function
 * @name findInIds
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @param {string} [params.status] - leave empty to not filter by status
 * @param {string} [params.locale] - leave empty to not filter by locale
 * @returns {Promise<BaseChallenge[]>}
 */
export async function findInIds({ ids, status, locale }) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  if (!status && !locale) return readChallengeRepository.findInIds({ ids });
  return readChallengeRepository.findInIdsByStatusAndLocale({ ids, status, locale });
}
