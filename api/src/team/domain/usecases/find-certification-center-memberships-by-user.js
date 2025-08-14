import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';
const findCertificationCenterMembershipsByUser = async function ({
  userId,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
} = {}) {
  return certificationCenterMembershipRepository.findByUserId(userId);
};

export { findCertificationCenterMembershipsByUser };
