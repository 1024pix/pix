import * as readSkillRepository from '../../infrastructure/repositories/read-skill-repository.js';

/**
 * @typedef BaseSkill
 * @type {object}
 * @property {string} id
 * @property {string} name
 * @property {string} competenceId
 * @property {string} tubeId
 */

/**
 * @function
 * @name findInIds
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @returns {Promise<BaseSkill[]>}
 */
export async function findInIds({ ids }) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  return readSkillRepository.findInIds({ ids });
}
