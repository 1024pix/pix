import * as injectedCertificationCenterRepository from '../../infrastructure/repositories/certification-center.repository.js';
const findPaginatedFilteredCertificationCenters = function ({
  filter,
  page,
  certificationCenterRepository = injectedCertificationCenterRepository,
} = {}) {
  return certificationCenterRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredCertificationCenters };
