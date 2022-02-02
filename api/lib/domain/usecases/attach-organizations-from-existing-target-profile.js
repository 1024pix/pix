const { TargetProfileOrganizations } = require('../models');

module.exports = async function attachOrganizationsFromExistingTargetProfile({
  targetProfileId,
  existingTargetProfileId,
  targetProfileRepository,
}) {
  const targetProfileOrganizations = new TargetProfileOrganizations({ id: targetProfileId });
  const organizationIds = await targetProfileRepository.findOrganizationIds(existingTargetProfileId);

  targetProfileOrganizations.attach(organizationIds);

  await targetProfileRepository.attachOrganizations(targetProfileOrganizations);
};
