import * as certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository.js';

async function execute({
  certificationCenterMembershipId,
  userId,
  dependencies = { certificationCenterMembershipRepository },
}) {
  const certificationCenterMembership = await dependencies.certificationCenterMembershipRepository.findById(
    certificationCenterMembershipId,
  );

  if (!certificationCenterMembership) return false;

  return await dependencies.certificationCenterMembershipRepository.isAdminOfCertificationCenter({
    certificationCenterId: certificationCenterMembership.certificationCenter.id,
    userId,
  });
}

export { execute };
