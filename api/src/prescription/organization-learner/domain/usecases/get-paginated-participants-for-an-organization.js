const getPaginatedParticipantsForAnOrganization = function ({
  organizationId,
  filters,
  page,
  sort,
  organizationParticipantRepository,
}) {
  return organizationParticipantRepository.findPaginatedFilteredParticipants({
    organizationId,
    filters,
    sort,
    page,
  });
};

export { getPaginatedParticipantsForAnOrganization };
