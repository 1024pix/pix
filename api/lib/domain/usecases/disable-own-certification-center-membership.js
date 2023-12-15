import { NotFoundError } from '../errors.js';

async function disableOwnCertificationCenterMembership({
  certificationCenterId,
  userId,
  certificationCenterMembershipRepository,
}) {
  const certificationCenterMembership =
    await certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId({
      certificationCenterId,
      userId,
    });

  if (!certificationCenterMembership) {
    throw new NotFoundError(
      `No certification center membership found with certificationCenterId: ${certificationCenterId} and userId: ${userId}`,
    );
  }

  certificationCenterMembership.disableMembership(userId);

  await certificationCenterMembershipRepository.update(certificationCenterMembership);
}

export { disableOwnCertificationCenterMembership };
