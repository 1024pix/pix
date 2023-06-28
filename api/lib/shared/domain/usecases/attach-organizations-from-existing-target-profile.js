import { OrganizationsToAttachToTargetProfile } from '../models/index.js';

const attachOrganizationsFromExistingTargetProfile = async function ({
  targetProfileId,
  existingTargetProfileId,
  organizationsToAttachToTargetProfileRepository,
  targetProfileRepository,
}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });
  const organizationIds = await targetProfileRepository.findOrganizationIds(existingTargetProfileId);

  targetProfileOrganizations.attach(organizationIds);

  await organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
};

export { attachOrganizationsFromExistingTargetProfile };
