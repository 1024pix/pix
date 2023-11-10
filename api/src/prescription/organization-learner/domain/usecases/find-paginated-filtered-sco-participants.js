const findPaginatedFilteredScoParticipants = function ({
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

export { findPaginatedFilteredScoParticipants };
