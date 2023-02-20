import { UserNotMemberOfOrganizationError } from '../errors';
import _ from 'lodash';

export default async function createOrUpdateUserOrgaSettings({
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
}
