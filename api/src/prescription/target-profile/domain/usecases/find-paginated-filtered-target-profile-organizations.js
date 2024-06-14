const findPaginatedFilteredOrganizationByTargetProfileId = function ({
  targetProfileId,
  filter,
  page,
  organizationRepository,
}) {
  return organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });
};

export { findPaginatedFilteredOrganizationByTargetProfileId };
