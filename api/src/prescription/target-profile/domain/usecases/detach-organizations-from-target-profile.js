import { TargetProfile } from '../models/TargetProfile.js';

const detachOrganizationsFromTargetProfile = async function ({
  targetProfileId,
  organizationIds,
  targetProfileBondRepository,
}) {
  const targetProfile = new TargetProfile({ id: targetProfileId });

  targetProfile.detach(organizationIds);

  return targetProfileBondRepository.update(targetProfile);
};

export { detachOrganizationsFromTargetProfile };
