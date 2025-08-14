import { UserNotFoundError } from '../../../shared/domain/errors.js';
import * as injectedEmailRepository from '../../../shared/mail/infrastructure/repositories/email.repository.js';
import { resetPasswordDemandRepository as injectedResetPasswordDemandRepository } from '../../infrastructure/repositories/reset-password-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { createResetPasswordDemandEmail } from '../emails/create-reset-password-demand.email.js';
import { resetPasswordService as injectedResetPasswordService } from '../services/reset-password.service.js';

export const createResetPasswordDemand = async function ({
  email,
  locale,
  resetPasswordService = injectedResetPasswordService,
  resetPasswordDemandRepository = injectedResetPasswordDemandRepository,
  userRepository = injectedUserRepository,
  emailRepository = injectedEmailRepository,
} = {}) {
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
