export default function findPaginatedFilteredTargetProfileSummariesForAdmin({
  filter,
  page,
  targetProfileSummaryForAdminRepository,
}) {
  return targetProfileSummaryForAdminRepository.findPaginatedFiltered({ filter, page });
}
