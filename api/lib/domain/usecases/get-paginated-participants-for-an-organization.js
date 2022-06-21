module.exports = function getPaginatedParticipantsForAnOrganization({
  organizationId,
  page,
  organizationParticipantRepository,
}) {
  return organizationParticipantRepository.getParticipantsByOrganizationId({
    organizationId,
    page,
  });
};
