module.exports = function findAvailableTargetProfiles({ organizationId, targetProfileRepository }) {
  return Promise.all([
    targetProfileRepository.findByFilters({ organizationId }),
    targetProfileRepository.findByFilters({ isPublic: true }),
  ])
    .then(([targetProfilesLinkedToOrganization, publicTargetProfiles]) => {
      return targetProfilesLinkedToOrganization.concat(publicTargetProfiles);
    });
};
