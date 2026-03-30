import { NotFoundError } from '../../../shared/domain/errors.js';
import { getInstance } from '../../../shared/infrastructure/repositories/skill-repository.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { BaseSkill } from '../../domain/models/BaseSkill.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

/**
 * @function
 * @name findInIds
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @returns {Promise<BaseSkill[]>}
 * @throws NotFoundError when at least one challenge in the given ids is not found
 */
export async function findInIds({ ids }) {
  const skillDtos = await getInstance().loadMany(ids);

  skillDtos.forEach((skillDtos, index) => {
    if (skillDtos) return;
    logger.warn({ skillId: ids[index] }, 'Acquis introuvable');
    throw new NotFoundError('Acquis introuvable');
  });

  return skillDtos.map((skillDto) => new BaseSkill(skillDto));
}
