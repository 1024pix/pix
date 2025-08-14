import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';
const updateCertificationCenterReferer = async function ({
  userId,
  isReferer,
  certificationCenterId,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
} = {}) {
  const actualReferer = await certificationCenterMembershipRepository.getRefererByCertificationCenterId({
    certificationCenterId,
  });

  if (actualReferer) {
    await certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId({
      userId: actualReferer.user.id,
      certificationCenterId,
      isReferer: false,
    });
  }

  return certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId({
    userId,
    certificationCenterId,
    isReferer,
  });
};

export { updateCertificationCenterReferer };
