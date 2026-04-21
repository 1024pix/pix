import { UserNotFoundError } from '../../../shared/domain/errors.js';
import { createResetPasswordDemandEmail } from '../emails/create-reset-password-demand.email.js';

/**
 * @param {Object} params
 * @param {string} params.email - The email address of the user requesting password reset
 * @param {string} params.locale - The locale/language for the email
 * @param {ResetPasswordService} params.resetPasswordService
 * @param {ResetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @param {UserRepository} params.userRepository
 * @param {EmailRepository} params.emailRepository
 * @returns {Promise<void>}
 */
export const createResetPasswordDemand = async function ({
  email,
  locale,
  resetPasswordService,
  resetPasswordDemandRepository,
  userRepository,
  emailRepository,
}) {
  try {
    await userRepository.isUserExistingByEmail(email);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return;
    } else {
      throw error;
    }
  }

  const temporaryKey = await resetPasswordService.generateTemporaryKey();
  await resetPasswordDemandRepository.create({ email, temporaryKey });

  const resetPasswordDemandEmail = createResetPasswordDemandEmail({ email, temporaryKey, locale });
  await emailRepository.sendEmail(resetPasswordDemandEmail);
};
