import * as injectedTargetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository.js';
const findPaginatedFilteredTargetProfileSummariesForAdmin = function ({
  filter,
  page,
  targetProfileSummaryForAdminRepository = injectedTargetProfileSummaryForAdminRepository,
} = {}) {
  return targetProfileSummaryForAdminRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredTargetProfileSummariesForAdmin };
