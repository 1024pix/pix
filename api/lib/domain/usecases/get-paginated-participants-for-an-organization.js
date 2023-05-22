const getPaginatedParticipantsForAnOrganization = function ({
  organizationId,
  filters,
  page,
  sort,
  organizationParticipantRepository,
}) {
  return organizationParticipantRepository.getParticipantsByOrganizationId({
    organizationId,
    filters,
    sort,
    page,
  });
};

export { getPaginatedParticipantsForAnOrganization };
