import { usecases } from '../../domain/usecases/index.js';
import { SkillDTO } from './models/SkillDTO.js';

/**
 * @typedef SkillDTO
 * @type {object}
 * @property {string} id
 * @property {number} difficulty
 * @property {string} tubeId
 */

/**
 * @function
 * @name findByIds
 * @deprecated use the new skills API
 * @param {Object} params
 * @param {Array<string>} params.ids
 * @returns {Promise<Array<SkillDTO>>}
 */
export async function findByIds({ ids = [] }) {
  if (!ids?.length) {
    return [];
  }
  const skills = await usecases.findSkillsByIds({ ids });

  return skills.map(_toApi);
}

const _toApi = (skill) => new SkillDTO(skill);
