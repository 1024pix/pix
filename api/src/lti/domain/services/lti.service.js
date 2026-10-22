import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { ltiPlatformRepository } from '../../infrastructure/repositories/lti-platform.repository.js';
import { InvalidLtiPlatformRegistrationError } from '../errors.js';

const logger = child('lti:service', { event: SCOPES.LTI });

export const ltiService = {
  /**
   * @param {string} platformConfigurationUrl
   * @returns {Promise<{
   *   ltiPlatform: import('../models/LtiPlatform.js').LtiPlatform
   *   platformConfiguration: import('oauth4webapi').AuthorizationServer
   * }>}
   */
  async discoverLtiPlatform(platformConfigurationUrl, dependencies = { httpAgent, ltiPlatformRepository }) {
    const { data: platformConfiguration, ...getConfigurationResponse } = await dependencies.httpAgent.get({
      url: platformConfigurationUrl,
      headers: { Accept: 'application/json' },
    });
    if (!getConfigurationResponse.isSuccessful) {
      logger.warn({ platformConfigurationUrl }, 'Could not fetch platform configuration');
      throw new InvalidLtiPlatformRegistrationError('Could not fetch platform configuration');
    }

    validatePlatformConfiguration(platformConfiguration);

    if (!platformConfigurationUrl.startsWith(platformConfiguration.issuer)) {
      logger.warn(
        { issuer: platformConfiguration.issuer, platformConfigurationUrl },
        'Inconsistent LTI platform configuration URL.',
      );
      throw new InvalidLtiPlatformRegistrationError('Inconsistent LTI platform configuration URL');
    }

    const ltiPlatform = await dependencies.ltiPlatformRepository.findByOrigin(platformConfiguration.issuer);
    if (!ltiPlatform) {
      logger.warn({ issuer: platformConfiguration.issuer }, 'Unauthorized LTI platform issuer.');
      throw new InvalidLtiPlatformRegistrationError('Unauthorized LTI platform issuer');
    }

    return { ltiPlatform, platformConfiguration };
  },

  /**
   * @param {object} args
   * @param {import('../models/LtiPlatformRegistration.js').LtiPlatformRegistration} args.registration
   * @param {object} args.deepLinkingSettings
   * @param {object[]} args.contentItems
   */
  async encodeDeepLinkingResponse(
    { contentItems, registration, deepLinkingSettings },
    dependencies = { cryptoService },
  ) {
    const privateKey = {
      format: 'jwk',
      key: JSON.parse(await dependencies.cryptoService.decrypt(registration.encryptedPrivateKey)),
    };

    return jsonwebtoken.sign(
      {
        iss: registration.clientId,
        aud: deepLinkingSettings.deep_link_return_url,
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': registration.deploymentId,
        'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        'https://purl.imsglobal.org/spec/lti-dl/claim/data': deepLinkingSettings.data,
        'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
      },
      privateKey,
      {
        expiresIn: 3600,
        algorithm: 'RS256',
        keyid: registration.publicKey.kid,
      },
    );
  },
};

const ltiPlatformConfigurationSchema = Joi.object({
  messages_supported: Joi.array()
    .items(ltiMessage('LtiResourceLinkRequest').required(), ltiMessage('LtiDeepLinkingRequest').required())
    .required(),
}).unknown(true);

const platformOpenidConfigurationSchema = Joi.object({
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
  'https://purl.imsglobal.org/spec/lti-platform-configuration': ltiPlatformConfigurationSchema.required(),
}).unknown(true);

function ltiMessage(type) {
  return Joi.object({
    type: Joi.string().valid(type).required(),
  }).unknown(true);
}

function validatePlatformConfiguration(platformConfiguration) {
  const { error } = platformOpenidConfigurationSchema.validate(platformConfiguration);
  if (error) {
    logger.warn({ platformConfiguration }, 'Invalid LTI platform configuration.');
    throw new InvalidLtiPlatformRegistrationError('Invalid LTI platform configuration', {
      cause: error,
    });
  }
}
