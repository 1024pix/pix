import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
import * as injectedTargetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository.js';
const updateTargetProfile = async function ({
  id,
  attributesToUpdate,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
  targetProfileForUpdateRepository = injectedTargetProfileForUpdateRepository,
} = {}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id });

  targetProfileForAdmin.update(attributesToUpdate);

  return targetProfileForUpdateRepository.update(targetProfileForAdmin);
};

export { updateTargetProfile };
