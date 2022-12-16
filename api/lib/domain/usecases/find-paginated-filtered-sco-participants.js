module.exports = function findPaginatedFilteredScoParticipants({
  organizationId,
  filter,
  page,
  scoOrganizationParticipantRepository,
}) {
  return scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
    organizationId,
    filter,
    page,
  });
};
