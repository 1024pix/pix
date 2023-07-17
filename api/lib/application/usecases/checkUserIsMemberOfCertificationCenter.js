import * as certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository.js';

const execute = async function (
  userId,
  certificationCenterId,
  dependencies = { certificationCenterMembershipRepository },
) {
  return await dependencies.certificationCenterMembershipRepository.isMemberOfCertificationCenter({
    userId,
    certificationCenterId,
  });
};

export { execute };
