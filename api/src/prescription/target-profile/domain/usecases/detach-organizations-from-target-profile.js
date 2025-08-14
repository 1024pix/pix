import * as injectedTargetProfileBondRepository from '../../infrastructure/repositories/target-profile-bond-repository.js';
import { TargetProfile } from '../models/TargetProfile.js';

const detachOrganizationsFromTargetProfile = async function ({
  targetProfileId,
  organizationIds,
  targetProfileBondRepository = injectedTargetProfileBondRepository,
} = {}) {
  const targetProfile = new TargetProfile({ id: targetProfileId });

  targetProfile.detach(organizationIds);

  return targetProfileBondRepository.update(targetProfile);
};

export { detachOrganizationsFromTargetProfile };
