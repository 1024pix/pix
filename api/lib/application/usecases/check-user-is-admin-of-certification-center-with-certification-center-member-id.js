import * as certificationCenterMemberRepository from '../../infrastructure/repositories/certification-center-member-repository.js';

async function execute({
  certificationCenterMemberId,
  userId,
  dependencies = { certificationCenterMemberRepository },
}) {
  const certificationCenterMember =
    await dependencies.certificationCenterMemberRepository.findById(certificationCenterMemberId);

  return await dependencies.certificationCenterMemberRepository.isAdminOfCertificationCenter({
    certificationCenterId: certificationCenterMember.certificationCenter.id,
    userId,
  });
}

export { execute };
