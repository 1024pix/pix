const { UserNotMemberOfOrganizationError } = require('../errors');
const _ = require('lodash');

module.exports = async function createOrUpdateUserOrgaSettings({
  userId,
  organizationId,
  userOrgaSettingsRepository,
  membershipRepository
}) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(`L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`);
  }

  const userOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(userId);

  if (_.isEmpty(userOrgaSettings)) {
    return userOrgaSettingsRepository.create(userId, organizationId);
  }

  return userOrgaSettingsRepository.update(userId, organizationId);
};
