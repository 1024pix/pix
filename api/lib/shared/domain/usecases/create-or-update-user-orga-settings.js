import { UserNotMemberOfOrganizationError } from '../errors.js';
import _ from 'lodash';

const createOrUpdateUserOrgaSettings = async function ({
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

export { createOrUpdateUserOrgaSettings };
