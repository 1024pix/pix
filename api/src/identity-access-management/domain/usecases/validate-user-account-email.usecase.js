import { getPixAppConnexionUrl } from '../../../shared/domain/services/url-service.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { emailValidationDemandRepository as injectedEmailValidationDemandRepository } from '../../infrastructure/repositories/email-validation-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';

/**
 * @param {{
 *   token: string,
 *   redirectUrl: string | null
 *   emailValidationDemandRepository: EmailValidationDemandRepository,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<string|null>}
 */
export const validateUserAccountEmail = async ({
  token,
  redirectUrl,
  emailValidationDemandRepository = injectedEmailValidationDemandRepository,
  userRepository = injectedUserRepository,
} = {}) => {
  try {
    if (!token) {
      return _getRedirectionUrl(redirectUrl);
    }

    const userId = await emailValidationDemandRepository.get(token);
    if (!userId) {
      return _getRedirectionUrl(redirectUrl);
    }

    const user = await userRepository.get(userId);

    user.markEmailAsValid();

    await userRepository.update(user.mapToDatabaseDto());
    await emailValidationDemandRepository.remove(token);
  } catch (error) {
    logger.error({
      message: error.message,
      context: 'email-validation',
      data: { token },
      team: 'acces',
    });
  }

  return _getRedirectionUrl(redirectUrl);
};

function _getRedirectionUrl(redirectUrl) {
  return redirectUrl || getPixAppConnexionUrl('fr-FR');
}
