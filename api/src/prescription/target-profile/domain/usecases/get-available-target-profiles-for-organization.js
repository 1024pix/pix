import * as injectedTargetProfileForSpecifierRepository from '../../infrastructure/repositories/target-profile-for-specifier-repository.js';
const getAvailableTargetProfilesForOrganization = function ({
  organizationId,
  targetProfileForSpecifierRepository = injectedTargetProfileForSpecifierRepository,
} = {}) {
  return targetProfileForSpecifierRepository.availableForOrganization(organizationId);
};

export { getAvailableTargetProfilesForOrganization };
