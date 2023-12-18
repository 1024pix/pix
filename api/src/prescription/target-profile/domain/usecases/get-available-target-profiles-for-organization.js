const getAvailableTargetProfilesForOrganization = function ({ organizationId, targetProfileForSpecifierRepository }) {
  return targetProfileForSpecifierRepository.availableForOrganization(organizationId);
};

export { getAvailableTargetProfilesForOrganization };
