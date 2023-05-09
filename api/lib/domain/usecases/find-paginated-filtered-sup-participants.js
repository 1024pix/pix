const findPaginatedFilteredSupParticipants = function ({
  organizationId,
  filter,
  page,
  sort,
  supOrganizationParticipantRepository,
}) {
  return supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
    organizationId,
    filter,
    page,
    sort,
  });
};

export { findPaginatedFilteredSupParticipants };
