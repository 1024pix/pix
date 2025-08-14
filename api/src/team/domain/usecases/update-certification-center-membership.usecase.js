import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js'; /**
 * @typedef {import('../../infrastructure/repositories/certification-center-membership.repository.js').certificationCenterMembershipRepository} CertificationCenterMembershipRepository
 */

/**
 * @param{object} params
 * @param{string} params.certificationCenterMembershipId
 * @param{string} role
 * @param{string} updatedByUserId
 * @param{CertificationCenterMembershipRepository} certificationCenterMembershipRepository
 * @returns {Promise<CertificationCenterMembership>}
 */
const updateCertificationCenterMembership = async function ({
  certificationCenterMembershipId,
  role,
  updatedByUserId,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
} = {}) {
  const certificationCenterMembershipToUpdate = await certificationCenterMembershipRepository.findById(
    certificationCenterMembershipId,
  );

  certificationCenterMembershipToUpdate.updateRole({ role, updatedByUserId });

  await certificationCenterMembershipRepository.update(certificationCenterMembershipToUpdate);

  const updatedCertificationCenterMembership = await certificationCenterMembershipRepository.findById(
    certificationCenterMembershipId,
  );

  return updatedCertificationCenterMembership;
};

export { updateCertificationCenterMembership };
