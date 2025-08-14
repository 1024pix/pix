import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
const findOrganizationTargetProfileSummariesForAdmin = function ({
  organizationId,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  return targetProfileAdministrationRepository.findByOrganization({ organizationId });
};

export { findOrganizationTargetProfileSummariesForAdmin };
