import _ from 'lodash';

import * as injectedSharedMembershipRepository from '../../../shared/infrastructure/repositories/membership-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import { userOrgaSettingsRepository as injectedUserOrgaSettingsRepository } from '../../infrastructure/repositories/user-orga-settings-repository.js';
import { UserNotMemberOfOrganizationError } from '../errors.js';

/**
 * @param {{
 * userId: string,
 * prescriberRepository: PrescriberRepository,
 * sharedMembershipRepository: sharedMembershipRepository,
 * userOrgaSettingsRepository: UserOrgaSettingsRepository
 * }} params
 * @return {Promise<Prescriber>}
 * @throws {UserNotMemberOfOrganizationError}
 */
export const getPrescriber = async function ({
  userId,
  prescriberRepository = injectedRepositories.prescriberRepository,
  sharedMembershipRepository = injectedSharedMembershipRepository,
  userOrgaSettingsRepository = injectedUserOrgaSettingsRepository,
} = {}) {
  const memberships = await sharedMembershipRepository.findByUserId({ userId });
  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(`L’utilisateur ${userId} n’est membre d’aucune organisation.`);
  }

  const userOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(userId);
  const firstOrganization = memberships[0].organization;

  if (_.isEmpty(userOrgaSettings)) {
    await userOrgaSettingsRepository.create(userId, firstOrganization.id);
  } else if (!_isCurrentOrganizationInMemberships(userOrgaSettings, memberships)) {
    await userOrgaSettingsRepository.update(userId, firstOrganization.id);
  }
  return prescriberRepository.getPrescriber({ userId });
};

function _isCurrentOrganizationInMemberships(userOrgaSettings, memberships) {
  const currentOrganizationId = userOrgaSettings.currentOrganization.id;
  return _.find(memberships, { organization: { id: currentOrganizationId } });
}
