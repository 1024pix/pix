import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import { createSelfDeleteUserAccountEmail } from '../emails/create-self-delete-user-account.email.js';

/**
 * @param{object} params
 * @param{number} params.userId
 * @returns {Promise<boolean>}
 */
export const anonymizeUserByItself = async function ({
  userId,
  locale,
  userRepository,
  emailRepository,
  anonymizeServices,
}) {
  const canAnonymize = await anonymizeServices.canAnonymizeItself({ userId });
  if (!canAnonymize) throw new ForbiddenAccess();

  const user = await userRepository.get(userId);

  const anonymizedByUserId = userId;
  const anonymizedByUserRole = 'USER';
  const client = 'PIX_APP';

  await anonymizeServices.anonymizeUser({ userId, anonymizedByUserId, anonymizedByUserRole, client });

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
