const { OrganizationsToAttachToTargetProfile } = require('../models/index.js');

module.exports = async function attachOrganizationsFromExistingTargetProfile({
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
