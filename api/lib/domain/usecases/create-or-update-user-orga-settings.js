const { UserNotMemberOfOrganizationError } = require('../errors.js');
const _ = require('lodash');

module.exports = async function createOrUpdateUserOrgaSettings({
  userId,
  organizationId,
  userOrgaSettingsRepository,
  membershipRepository,
}) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(
      `L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`
    );
  }

  return userOrgaSettingsRepository.createOrUpdate({ userId, organizationId });
};
