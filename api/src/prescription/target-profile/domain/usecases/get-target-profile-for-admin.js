import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
const getTargetProfileForAdmin = async function ({
  targetProfileId,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  return targetProfileAdministrationRepository.get({ id: targetProfileId });
};

export { getTargetProfileForAdmin };
