import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
const outdateTargetProfile = async function ({
  id,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  await targetProfileAdministrationRepository.update({ id, outdated: true });
};

export { outdateTargetProfile };
