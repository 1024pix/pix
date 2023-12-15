import * as certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository.js';

async function execute({ certificationCenterId, userId, dependencies = { certificationCenterMembershipRepository } }) {
  const currentActiveAdmins =
    await dependencies.certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId(
      certificationCenterId,
    );
  const activeAdminsLeftAfterDisablingCurrentUser = currentActiveAdmins.filter(
    (currentActiveAdmin) => currentActiveAdmin.user.id !== userId,
  );

  return activeAdminsLeftAfterDisablingCurrentUser.length > 0;
}

export { execute };
