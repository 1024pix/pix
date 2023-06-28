const findTargetProfileOrganizations = function ({ targetProfileId, filter, page, organizationRepository }) {
  return organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });
};

export { findTargetProfileOrganizations };
