import { UserNotMemberOfOrganizationError } from '../../../../../lib/domain/errors.js';
import _ from 'lodash';

function _isCurrentOrganizationInMemberships(userOrgaSettings, memberships) {
  const currentOrganizationId = userOrgaSettings.currentOrganization.id;
  return _.find(memberships, { organization: { id: currentOrganizationId } });
}

const getPrescriber = async function ({
  userId,
  prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
}) {
  const memberships = await membershipRepository.findByUserId({ userId });
  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(`L’utilisateur ${userId} n’est membre d’aucune organisation.`);
  }

  const userOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(userId);
  const firstOrganization = memberships[0].organization;

  if (_.isEmpty(userOrgaSettings)) {
    await userOrgaSettingsRepository.create(userId, firstOrganization.id);
    return prescriberRepository.getPrescriber(userId);
  }

  if (!_isCurrentOrganizationInMemberships(userOrgaSettings, memberships)) {
    await userOrgaSettingsRepository.update(userId, firstOrganization.id);
  }

  return prescriberRepository.getPrescriber(userId);
};

export { getPrescriber };
