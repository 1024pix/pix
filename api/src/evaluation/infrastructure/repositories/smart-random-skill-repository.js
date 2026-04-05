import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { SmartRandomSkill } from '../../domain/models/SmartRandomSkill.js';

/**
 *
 * @param {string} competenceId
 * @returns {Promise<SmartRandomSkill[]>}
 */
export async function findActiveByCompetenceId(competenceId) {
  const lcmsSkills = await skillRepository.findActiveByCompetenceId_proxy(competenceId);
  return lcmsSkills.map(
    (lcmsSkill) =>
      new SmartRandomSkill({
        id: lcmsSkill.id,
        name: lcmsSkill.name,
        difficulty: lcmsSkill.level,
      }),
  );
}
