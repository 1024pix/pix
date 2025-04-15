import Joi from 'joi';

import { config } from '../../../shared/config.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { InvalidLtiPlatformRegistrationError } from '../errors.js';

const logger = child('iam:lti', { event: SCOPES.IAM });

function ltiMessage(type) {
  return Joi.object({
    type: Joi.string().valid(type).required(),
  }).unknown(true);
}

const platformLtiConfigurationSchema = Joi.object({
  messages_supported: Joi.array()
    .items(ltiMessage('LtiResourceLinkRequest').required(), ltiMessage('LtiDeepLinkingRequest').required())
    .required(),
}).unknown(true);

const platformOpenIdConfigurationSchema = Joi.object({
  issuer: Joi.string().uri().required(),
  authorization_endpoint: Joi.string().uri().required(),
  registration_endpoint: Joi.string().uri().required(),
  jwks_uri: Joi.string().uri().required(),
  token_endpoint: Joi.string().uri().required(),
  token_endpoint_auth_methods_supported: Joi.array()
    .items(Joi.string().valid('private_key_jwt').required(), Joi.string())
    .required(),
  token_endpoint_auth_signing_alg_values_supported: Joi.array()
    .items(Joi.string().valid('RS256').required(), Joi.string())
    .required(),
  scopes_supported: Joi.array().items(Joi.string().valid('openid').required(), Joi.string()).required(),
  response_types_supported: Joi.array().items(Joi.string().valid('id_token').required(), Joi.string()).required(),
  claims_supported: Joi.array().items(Joi.string().valid('email').required(), Joi.string()).required(),
  'https://purl.imsglobal.org/spec/lti-platform-configuration': platformLtiConfigurationSchema.required(),
}).unknown(true);

function createPixToolConfiguration(baseUrl) {
  return {
    response_types: ['id_token'],
    jwks_uri: `${baseUrl}/api/lti/keys`,
    initiate_login_uri: `${baseUrl}/api/lti/init`,
    grant_types: ['client_credentials', 'implicit'],
    redirect_uris: [`${baseUrl}/api/lti/launch`],
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
      target_link_uri: `${baseUrl}/api/lti`,
      domain: new URL(baseUrl).hostname,
      description: 'Intégration avec la plateforme Pix',
      messages: [
        {
          type: 'LtiDeepLinkingRequest',
          target_link_uri: `${baseUrl}/api/lti/content-selection`,
        },
      ],
      claims: ['sub', 'iss', 'name', 'family_name', 'given_name', 'email'],
    },
  };
}

/**
 * @param {object} args
 * @param {string} args.platformConfigurationUrl
 * @param {string} args.registrationToken
 * @param {typeof import('../../../shared/infrastructure/http-agent.js').httpAgent} args.httpAgent
 * @param {typeof import('../../infrastructure/repositories/lti-platform-registration.repository.js').ltiPlatformRegistrationRepository} args.ltiPlatformRegistrationRepository
 * @param {import('../../../shared/domain/services/crypto-service.js')} args.cryptoService
 */

export async function registerLtiPlatform({
  platformConfigurationUrl,
  registrationToken,
  httpAgent,
  ltiPlatformRegistrationRepository,
  cryptoService,
}) {
  const { data: platformConfiguration, ...getConfigurationResponse } = await httpAgent.get({
    url: platformConfigurationUrl,
    headers: { Accept: 'application/json' },
  });
  if (!getConfigurationResponse.isSuccessful) {
    logger.warn({ platformConfigurationUrl }, 'Could not fetch platform configuration');
    throw new InvalidLtiPlatformRegistrationError('Could not fetch platform configuration');
  }

  const { error: platformConfigurationValidationError } =
    platformOpenIdConfigurationSchema.validate(platformConfiguration);
  if (platformConfigurationValidationError) {
    logger.warn({ platformConfiguration }, 'Invalid LTI platform configuration.');
    throw new InvalidLtiPlatformRegistrationError('Invalid LTI platform configuration', {
      cause: platformConfigurationValidationError,
    });
  }

  if (!config.lti.authorizedPlatforms.includes(platformConfiguration.issuer)) {
    logger.warn({ issuer: platformConfiguration.issuer }, 'Unauthorized LTI platform issuer.');
    throw new InvalidLtiPlatformRegistrationError('Unauthorized LTI platform issuer');
  }

  if (!platformConfigurationUrl.startsWith(platformConfiguration.issuer)) {
    logger.warn(
      { issuer: platformConfiguration.issuer, platformConfigurationUrl },
      'Inconsistent LTI platform configuration URL.',
    );
    throw new InvalidLtiPlatformRegistrationError('Inconsistent LTI platform configuration URL');
  }

  const pixToolConfiguration = createPixToolConfiguration(config.baseUrl);

  const { data: pixToolRegistration, ...registrationResponse } = await httpAgent.post({
    url: platformConfiguration.registration_endpoint,
    headers: {
      Authorization: `Bearer ${registrationToken}`,
      'Content-type': 'application/json',
    },
    payload: pixToolConfiguration,
  });
  if (!registrationResponse.isSuccessful) {
    logger.error(registrationResponse, 'Registration with LTI platform failed.');
    throw new InvalidLtiPlatformRegistrationError('Registration with the platform failed');
  }

  const { publicKey, privateKey } = await cryptoService.generateJSONWebKeyPair();
  const encryptedPrivateKey = await cryptoService.encrypt(JSON.stringify(privateKey));

  await ltiPlatformRegistrationRepository.save({
    clientId: pixToolRegistration.client_id,
    platformOrigin: platformConfiguration.issuer,
    platformOpenIdConfigUrl: platformConfigurationUrl,
    encryptedPrivateKey,
    toolConfig: pixToolRegistration,
    publicKey,
    status: 'pending',
  });

  logger.info(
    { client_id: pixToolRegistration.client_id, issuer: platformConfiguration.issuer },
    'Registration with LTI platform done.',
  );
}
