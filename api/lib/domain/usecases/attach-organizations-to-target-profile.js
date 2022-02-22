const { OrganizationsToAttachToTargetProfile } = require('../models');

module.exports = async function attachOrganizationsToTargetProfile({
  targetProfileId,
  organizationIds,
  targetProfileShareRepository,
}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return targetProfileShareRepository.attachOrganizations(targetProfileOrganizations);
};
