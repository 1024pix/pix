module.exports = function findPaginatedFilteredSupParticipants({
  organizationId,
  filter,
  page,
  supOrganizationParticipantRepository,
}) {
  return supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
    organizationId,
    filter,
    page,
  });
};
