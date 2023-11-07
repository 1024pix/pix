import { NotFoundError } from '../errors.js';

async function setCertificationCenterMembershipRoleToAdmin({
  certificationCenterId,
  userId,
  certificationCenterMembershipRepository,
}) {
  const certificationCenterMembership =
    await certificationCenterMembershipRepository.findOneWithCertificationCenterIdAndUserId({
      certificationCenterId,
      userId,
    });

  if (!certificationCenterMembership) {
    throw new NotFoundError(
      `Certification center membership not found with certificationCenterId(${certificationCenterId}) and userId(${userId})`,
    );
  }

  certificationCenterMembership.updateRole({ role: 'ADMIN' });

  await certificationCenterMembershipRepository.update(certificationCenterMembership);
}

export { setCertificationCenterMembershipRoleToAdmin };
