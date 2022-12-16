module.exports = function getPaginatedParticipantsForAnOrganization({
  organizationId,
  filters,
  page,
  organizationParticipantRepository,
}) {
  return organizationParticipantRepository.getParticipantsByOrganizationId({
    organizationId,
    filters,
    page,
  });
};
