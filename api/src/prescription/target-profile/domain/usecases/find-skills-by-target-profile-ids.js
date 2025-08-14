import * as injectedTargetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
const findSkillsByTargetProfileIds = async function ({
  targetProfileIds,
  targetProfileRepository = injectedTargetProfileRepository,
} = {}) {
  return targetProfileRepository.findSkillsByIds({ targetProfileIds });
};

export { findSkillsByTargetProfileIds };
