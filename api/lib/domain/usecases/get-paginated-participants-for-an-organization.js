module.exports = function getPaginatedParticipantsForAnOrganization({
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
