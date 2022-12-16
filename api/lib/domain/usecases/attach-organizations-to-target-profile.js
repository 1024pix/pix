const { OrganizationsToAttachToTargetProfile } = require('../models');

module.exports = async function attachOrganizationsToTargetProfile({
  targetProfileId,
  organizationIds,
  organizationsToAttachToTargetProfileRepository,
}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
};
