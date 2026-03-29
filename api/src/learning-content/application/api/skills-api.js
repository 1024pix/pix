import * as readSkillRepository from '../../infrastructure/repositories/read-skill-repository.js';

/**
 * @function
 * @name findInIds
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @returns {Promise<BaseSkill[]>}
 * @throws NotFoundError when at least one skill in the given ids is not found
 */
export async function findInIds({ ids }) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  return readSkillRepository.findInIds({ ids });
}
