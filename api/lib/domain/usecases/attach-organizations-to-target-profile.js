import { OrganizationsToAttachToTargetProfile } from '../models';

export default async function attachOrganizationsToTargetProfile({
  targetProfileId,
  organizationIds,
  organizationsToAttachToTargetProfileRepository,
}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
}
