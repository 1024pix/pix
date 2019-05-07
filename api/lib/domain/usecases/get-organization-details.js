const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getOrganizationDetails({
  userId,
  organizationId,
  userRepository,
  organizationRepository,
}) {
  const user = await userRepository.get(userId);

  if (user.hasRolePixMaster || user.boardOrganizationId === organizationId) {
    return organizationRepository.get(organizationId);
  }

  throw new UserNotAuthorizedToAccessEntity('User does not have access to this organization.');
};
