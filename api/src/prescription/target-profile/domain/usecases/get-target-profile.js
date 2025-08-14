import * as injectedTargetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
const getTargetProfile = async function ({
  targetProfileId,
  targetProfileRepository = injectedTargetProfileRepository,
} = {}) {
  return targetProfileRepository.get(targetProfileId);
};

export { getTargetProfile };
