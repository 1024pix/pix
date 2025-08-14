import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import * as injectedEmailRepository from '../../../shared/mail/infrastructure/repositories/email.repository.js';
import * as injectedPrivacyUsersApiRepository from '../../infrastructure/repositories/privacy-users-api.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { createSelfDeleteUserAccountEmail } from '../emails/create-self-delete-user-account.email.js';

/**
 * @typedef {import('../../infrastructure/repositories/privacy-users-api.repository.js')} PrivacyUsersApiRepository
 */

/**
 * @param{object} params
 * @param{number} params.userId
 * @param{PrivacyUsersApiRepository} privacyUsersApiRepository
 * @returns {Promise<boolean>}
 */
export const selfDeleteUserAccount = async function ({
  userId,
  locale,
  userRepository = injectedUserRepository,
  privacyUsersApiRepository = injectedPrivacyUsersApiRepository,
  emailRepository = injectedEmailRepository,
} = {}) {
  const canSelfDeleteAccount = await privacyUsersApiRepository.canSelfDeleteAccount({ userId });

  if (!canSelfDeleteAccount) {
    throw new ForbiddenAccess();
  }

  const user = await userRepository.get(userId);

  const anonymizedByUserId = userId;
  const anonymizedByUserRole = 'USER';
  const client = 'PIX_APP';
  await privacyUsersApiRepository.anonymizeUser({ userId, anonymizedByUserId, anonymizedByUserRole, client });

  if (user.email) {
    await emailRepository.sendEmailAsync(
      createSelfDeleteUserAccountEmail({
        locale: locale,
        email: user.email,
        firstName: user.firstName,
      }),
    );
  }
};
