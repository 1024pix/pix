const findPaginatedFilteredCertificationCenters = function ({ filter, page, certificationCenterRepository }) {
  return certificationCenterRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredCertificationCenters };
