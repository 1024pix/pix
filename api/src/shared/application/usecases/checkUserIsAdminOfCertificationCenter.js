import * as certificationCenterMembershipRepository from '../../../../lib/infrastructure/repositories/certification-center-membership-repository.js';

const execute = async function (
  userId,
  certificationCenterId,
  dependencies = { certificationCenterMembershipRepository },
) {
  return await dependencies.certificationCenterMembershipRepository.isAdminOfCertificationCenter({
    userId,
    certificationCenterId,
  });
};

export { execute };
