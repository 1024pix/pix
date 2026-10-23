import {
  allowInsecureRequests,
  dynamicClientRegistrationRequest,
  processDynamicClientRegistrationResponse,
} from 'oauth4webapi';

import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { LtiPlatformRegistration } from '../models/LtiPlatformRegistration.js';

const logger = child('lti:register-lti-platform', { event: SCOPES.LTI });

/**
 * @param {object} args
 * @param {string} args.platformConfigurationUrl
 * @param {string} args.registrationToken
 * @param {typeof import('../../infrastructure/repositories/lti-platform-registration.repository.js').ltiPlatformRegistrationRepository} args.ltiPlatformRegistrationRepository
 * @param {typeof import('../../../shared/domain/services/crypto-service.js').cryptoService} args.cryptoService
 * @param {typeof import('../services/lti.service.js').ltiService} args.ltiService
 */
export async function registerLtiPlatform({
  platformConfigurationUrl,
  registrationToken,
  ltiPlatformRegistrationRepository,
  cryptoService,
  ltiService,
}) {
  const { ltiPlatform, platformConfiguration } = await ltiService.discoverLtiPlatform(platformConfigurationUrl);

  const pixToolConfiguration = ltiService.createPixToolConfiguration();

  const response = await dynamicClientRegistrationRequest(platformConfiguration, pixToolConfiguration, {
    initialAccessToken: registrationToken,
    [allowInsecureRequests]: true,
  });

  const pixToolRegistration = await processDynamicClientRegistrationResponse(response);

  const { publicKey, privateKey } = await cryptoService.generateJSONWebKeyPair();
  const encryptedPrivateKey = await cryptoService.encrypt(JSON.stringify(privateKey));

  const savedRegistration = await ltiPlatformRegistrationRepository.save({
    clientId: pixToolRegistration.client_id,
    platformId: ltiPlatform.id,
    platformOpenIdConfigUrl: platformConfigurationUrl,
    encryptedPrivateKey,
    toolConfig: pixToolRegistration,
    publicKey,
    status: LtiPlatformRegistration.status.ACTIVE,
  });

  logger.info(
    { clientId: pixToolRegistration.client_id, issuer: platformConfiguration.issuer },
    'Registration with LTI platform done.',
  );

  return savedRegistration;
}
