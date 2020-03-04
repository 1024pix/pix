const { UserNotMemberOfOrganizationError } = require('../errors');
const _ = require('lodash');

module.exports = async function updateUserOrgaSettings(
  { userId,
    organizationId,
    userOrgaSettingsRepository,
    membershipRepository
  }) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(`L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`);
  }

  return userOrgaSettingsRepository.update(userId, organizationId);
};
