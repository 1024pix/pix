module.exports = function ({ organizationId, TargetProfileForSpecifierRepository }) {
  return TargetProfileForSpecifierRepository.availableForOrganization(organizationId);
};
