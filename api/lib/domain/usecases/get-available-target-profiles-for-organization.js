module.exports = function getAvailableTargetProfilesForOrganization({
  organizationId,
  TargetProfileForSpecifierRepository,
}) {
  return TargetProfileForSpecifierRepository.availableForOrganization(organizationId);
};
