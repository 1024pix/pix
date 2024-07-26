import * as membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository.js';

async function execute({ organizationId, userId, dependencies = { membershipRepository } }) {
  const currentActiveAdmins = await dependencies.membershipRepository.findAdminsByOrganizationId({ organizationId });
  const activeAdminsLeftAfterDisablingCurrentUser = currentActiveAdmins.filter(
    (currentActiveAdmin) => currentActiveAdmin.user.id !== userId,
  );

  return activeAdminsLeftAfterDisablingCurrentUser.length > 0;
}

export { execute };
