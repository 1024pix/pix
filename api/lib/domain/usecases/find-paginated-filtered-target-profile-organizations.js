module.exports = function findTargetProfileOrganizations({ targetProfileId, filter, page, organizationRepository }) {
  return organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });
};
