const findPaginatedFilteredTargetProfileSummariesForAdmin = function ({
  filter,
  page,
  targetProfileSummaryForAdminRepository,
}) {
  return targetProfileSummaryForAdminRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredTargetProfileSummariesForAdmin };
