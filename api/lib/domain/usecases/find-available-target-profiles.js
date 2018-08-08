const TargetProfile = require('../models/TargetProfile');

module.exports = async function findAvailableTargetProfiles({
  organizationId,
  targetProfileRepository
}) {
  let availableTargetProfiles = [];

  const targetProfilesLinkedToOrganization = await targetProfileRepository.findByFilters({ organizationId });
  const publicTargetProfiles = await targetProfileRepository.findByFilters({ isPublic: true});
  availableTargetProfiles = availableTargetProfiles.concat(targetProfilesLinkedToOrganization).concat(publicTargetProfiles);
  return availableTargetProfiles;

};
