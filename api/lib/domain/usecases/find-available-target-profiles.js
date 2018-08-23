module.exports = function findAvailableTargetProfiles({ organizationId, targetProfileRepository }) {
  return Promise.all([
    targetProfileRepository.findTargetProfilesByOrganizationId(organizationId),
    targetProfileRepository.findPublicTargetProfiles(),
  ])
    .then(([targetProfilesLinkedToOrganization, publicTargetProfiles]) => {
      return targetProfilesLinkedToOrganization.concat(publicTargetProfiles);
    });
};
