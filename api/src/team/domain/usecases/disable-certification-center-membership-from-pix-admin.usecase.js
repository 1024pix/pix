import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';
const disableCertificationCenterMembershipFromPixAdmin = async function ({
  certificationCenterMembershipId,
  updatedByUserId,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
} = {}) {
  return certificationCenterMembershipRepository.disableById({ certificationCenterMembershipId, updatedByUserId });
};

export { disableCertificationCenterMembershipFromPixAdmin };
