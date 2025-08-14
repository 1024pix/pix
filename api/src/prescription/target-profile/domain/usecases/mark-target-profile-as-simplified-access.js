import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
const markTargetProfileAsSimplifiedAccess = async function ({
  id,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  return targetProfileAdministrationRepository.update({ id, isSimplifiedAccess: true });
};

export { markTargetProfileAsSimplifiedAccess };
