import { TargetProfile } from '../../../../src/shared/domain/models/target-profile-management/TargetProfile.js';

const detachOrganizationsFromTargetProfile = async function ({
  targetProfileId,
  organizationIds,
  targetProfileRepository,
}) {
  const targetProfile = new TargetProfile({ id: targetProfileId });

  targetProfile.detach(organizationIds);

  return targetProfileRepository.update(targetProfile);
};

export { detachOrganizationsFromTargetProfile };
