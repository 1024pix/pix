const findPaginatedFilteredCertificationCenters = function ({
  filter,
  page,
  organizationalEntitiesCertificationCenterRepository,
}) {
  return organizationalEntitiesCertificationCenterRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredCertificationCenters };
