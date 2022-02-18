const { TargetProfileOrganizations } = require('../models');

module.exports = async function attachOrganizationsToTargetProfile({
  targetProfileId,
  organizationIds,
  targetProfileShareRepository,
}) {
  const targetProfileOrganizations = new TargetProfileOrganizations({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return targetProfileShareRepository.attachOrganizations(targetProfileOrganizations);
};
