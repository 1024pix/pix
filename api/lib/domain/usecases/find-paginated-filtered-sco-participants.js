module.exports = function findPaginatedFilteredScoParticipants({
  organizationId,
  filter,
  page,
  scoOrganizationParticipantRepository,
  sort,
}) {
  return scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
    organizationId,
    filter,
    page,
    sort,
  });
};
