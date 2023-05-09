const getAvailableTargetProfilesForOrganization = function ({ organizationId, TargetProfileForSpecifierRepository }) {
  return TargetProfileForSpecifierRepository.availableForOrganization(organizationId);
};

export { getAvailableTargetProfilesForOrganization };
