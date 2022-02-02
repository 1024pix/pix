const { TargetProfileOrganizations } = require('../models');

module.exports = async function attachOrganizationsToTargetProfile({
  targetProfileId,
  organizationIds,
  targetProfileRepository,
}) {
  const targetProfileOrganizations = new TargetProfileOrganizations({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return targetProfileRepository.attachOrganizations(targetProfileOrganizations);
};
