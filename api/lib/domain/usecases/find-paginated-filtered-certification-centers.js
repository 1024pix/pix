module.exports = function findPaginatedFilteredCertificationCenters({ filter, page, certificationCenterRepository }) {
  return certificationCenterRepository.findPaginatedFiltered({ filter, page });
};
