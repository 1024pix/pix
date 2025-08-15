import * as injectedSharedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';

export function findSkillsByIds({ ids, sharedSkillRepository = injectedSharedSkillRepository } = {}) {
  return sharedSkillRepository.findByRecordIds(ids);
}
