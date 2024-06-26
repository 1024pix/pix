import { monitoringTools } from '../../../../lib/infrastructure/monitoring-tools.js';
import { config } from '../../../shared/config.js';

/**
 * @param {{
 *   token: string,
 *   redirectUri: string | null
 *   emailValidationDemandRepository: EmailValidationDemandRepository,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<string|null>}
 */
export const validateUserAccountEmail = async ({
  token,
  redirectUri,
  emailValidationDemandRepository,
  userRepository,
}) => {
  try {
    if (!token) {
      return _getRedirectionUrl(redirectUri);
    }

    const userId = await emailValidationDemandRepository.get(token);
    if (!userId) {
      return _getRedirectionUrl(redirectUri);
    }

    const user = await userRepository.get(userId);

    user.markEmailAsValid();

    await userRepository.update(user.mapToDatabaseDto());
    await emailValidationDemandRepository.remove(token);
  } catch (error) {
    monitoringTools.logErrorWithCorrelationIds({
      message: error.message,
      context: 'email-validation',
      data: { token },
      team: 'acces',
    });
  }

  return _getRedirectionUrl(redirectUri);
};

function _getRedirectionUrl(redirectUri) {
  return redirectUri || `${config.domain.pixApp + config.domain.tldFr}/connexion`;
}
