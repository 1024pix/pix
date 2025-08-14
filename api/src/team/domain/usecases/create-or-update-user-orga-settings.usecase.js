import _ from 'lodash';

import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';
import { userOrgaSettingsRepository as injectedUserOrgaSettingsRepository } from '../../infrastructure/repositories/user-orga-settings-repository.js';
import { UserNotMemberOfOrganizationError } from '../errors.js';

const createOrUpdateUserOrgaSettings = async function ({
  userId,
  organizationId,
  userOrgaSettingsRepository = injectedUserOrgaSettingsRepository,
  membershipRepository = injectedMembershipRepository,
} = {}) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(
      `L'utilisateur ${userId} n'est pas membre de l'organisation ${organizationId}.`,
    );
  }

  return userOrgaSettingsRepository.createOrUpdate({ userId, organizationId });
};

export { createOrUpdateUserOrgaSettings };
