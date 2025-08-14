import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';
const findCertificationCenterMembershipsByCertificationCenter = function ({
  certificationCenterId,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
} = {}) {
  return certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByRole({
    certificationCenterId,
  });
};

export { findCertificationCenterMembershipsByCertificationCenter };
