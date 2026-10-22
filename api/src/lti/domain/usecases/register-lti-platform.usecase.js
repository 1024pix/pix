import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { InvalidLtiPlatformRegistrationError } from '../errors.js';
import { LtiPlatformRegistration } from '../models/LtiPlatformRegistration.js';

const logger = child('lti:register-lti-platform', { event: SCOPES.LTI });

/**
 * @param {object} args
 * @param {string} args.platformConfigurationUrl
 * @param {string} args.registrationToken
 * @param {typeof import('../../../shared/infrastructure/http-agent.js').httpAgent} args.httpAgent
 * @param {typeof import('../../infrastructure/repositories/lti-platform-registration.repository.js').ltiPlatformRegistrationRepository} args.ltiPlatformRegistrationRepository
 * @param {typeof import('../../../shared/domain/services/crypto-service.js').cryptoService} args.cryptoService
 * @param {typeof import('../services/lti.service.js').ltiService} args.ltiService
 */
export async function registerLtiPlatform({
  platformConfigurationUrl,
  registrationToken,
  httpAgent,
  ltiPlatformRegistrationRepository,
  cryptoService,
  ltiService,
  urlService,
}) {
  const { ltiPlatform, platformConfiguration } = await ltiService.discoverLtiPlatform(platformConfigurationUrl);

  const pixToolConfiguration = createPixToolConfiguration({ urlService });

  const { data: pixToolRegistration, ...registrationResponse } = await httpAgent.post({
    url: platformConfiguration.registration_endpoint,
    headers: {
      Authorization: `Bearer ${registrationToken}`,
    },
    payload: pixToolConfiguration,
  });
  if (!registrationResponse.isSuccessful) {
    logger.error(registrationResponse, 'Registration with LTI platform failed.');
    throw new InvalidLtiPlatformRegistrationError('Registration with the platform failed');
  }

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

function createPixToolConfiguration({ urlService }) {
  const locale = 'fr-FR'; // TODO: Generate this dynamically
  const jwksUrl = urlService.getPixApiUrl('/api/lti/keys');
  const initiateLoginUrl = urlService.getPixApiUrl('/api/lti/init');
  const deepLinkingUrl = urlService.getPixOrgaUrl(locale, { pathname: '/api/lti/deep-linking' });
  const resourceLinkUrl = urlService.getPixAppUrl(locale, { pathname: '/api/lti/resource-link' });
  return {
    response_types: ['id_token'],
    jwks_uri: jwksUrl, // TODO: Should be on gateway.pix.fr?
    initiate_login_uri: initiateLoginUrl,
    grant_types: ['client_credentials', 'implicit'],
    redirect_uris: [deepLinkingUrl, resourceLinkUrl],
    application_type: 'web',
    token_endpoint_auth_method: 'private_key_jwt',
    client_name: 'Pix',
    logo_uri: 'https://app.pix.fr/images/pix-logo.svg',
    scope: [
      'https://purl.imsglobal.org/spec/lti-ags/scope/score',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
    ].join(' '),
    'https://purl.imsglobal.org/spec/lti-tool-configuration': {
      target_link_uri: resourceLinkUrl,
      domain: new URL(resourceLinkUrl).hostname,
      description: 'Intégration avec la plateforme Pix',
      messages: [
        {
          type: 'LtiDeepLinkingRequest',
          target_link_uri: deepLinkingUrl,
        },
      ],
      claims: ['sub', 'iss', 'name', 'family_name', 'given_name', 'email'],
    },
  };
}
