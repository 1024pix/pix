import { OrganizationsToAttachToTargetProfile } from '../models';

export default async function attachOrganizationsFromExistingTargetProfile({
  targetProfileId,
  existingTargetProfileId,
  organizationsToAttachToTargetProfileRepository,
  targetProfileRepository,
}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });
  const organizationIds = await targetProfileRepository.findOrganizationIds(existingTargetProfileId);

  targetProfileOrganizations.attach(organizationIds);

  await organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
}
