import { OrganizationsToAttachToTargetProfile } from '../models/index.js';

const attachOrganizationsToTargetProfile = async function ({
  targetProfileId,
  organizationIds,
  organizationsToAttachToTargetProfileRepository,
}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
};

export { attachOrganizationsToTargetProfile };
