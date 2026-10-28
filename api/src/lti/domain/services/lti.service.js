import jsonwebtoken from 'jsonwebtoken';

import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as urlService from '../../../shared/domain/services/url-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { ltiPlatformRepository } from '../../infrastructure/repositories/lti-platform.repository.js';
import { InvalidLtiPlatformRegistrationError } from '../errors.js';
import { validatePlatformConfiguration } from '../validators/platform-configuration.validator.js';

const logger = child('lti:service', { event: SCOPES.LTI });

const ORGANIZATION_EXTERNAL_IDS_CUSTOM_CLAIM = 'pix_orgas';

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

    const validationError = validatePlatformConfiguration(platformConfiguration);
    if (validationError) {
      logger.warn({ platformConfiguration, err: validationError }, 'Invalid LTI platform configuration.');
      throw new InvalidLtiPlatformRegistrationError('Invalid LTI platform configuration', {
        cause: validationError,
      });
    }

    if (!platformConfigurationUrl.startsWith(platformConfiguration.issuer)) {
      logger.warn(
        { issuer: platformConfiguration.issuer, platformConfigurationUrl },
        'Inconsistent LTI platform configuration URL.',
      );
      throw new InvalidLtiPlatformRegistrationError('Inconsistent LTI platform configuration URL');
    }

    const ltiPlatform = await dependencies.ltiPlatformRepository.findByIssuer(platformConfiguration.issuer);
    if (!ltiPlatform) {
      logger.warn({ issuer: platformConfiguration.issuer }, 'Unauthorized LTI platform issuer.');
      throw new InvalidLtiPlatformRegistrationError('Unauthorized LTI platform issuer');
    }

    return { ltiPlatform, platformConfiguration };
  },

  createPixToolConfiguration({ locale = 'fr-FR', isDevelopmentPlatform = false } = {}, dependencies = { urlService }) {
    const jwksUrl = dependencies.urlService.getPixAuthUrl(locale, { pathname: '/api/lti/keys' });
    const initiateLoginUrl = dependencies.urlService.getPixAuthUrl(locale, { pathname: '/api/lti/init' });
    const deepLinkingUrl = dependencies.urlService.getPixOrgaUrl(locale, { pathname: '/api/lti/deep-linking' });
    const resourceLinkUrl = dependencies.urlService.getPixAppUrl(locale, { pathname: '/api/lti/resource-link' });

    return {
      response_types: ['id_token'],
      jwks_uri: jwksUrl,
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
        custom_parameters: isDevelopmentPlatform
          ? {
              [ORGANIZATION_EXTERNAL_IDS_CUSTOM_CLAIM]: ['SCO_SIECLE_MANAGING', 'SCO_NOT_MANAGING'].join(','),
            }
          : {},
      },
    };
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

  deserializeDeepLinkingCustomClaims(customClaims) {
    return {
      organizationExternalIds:
        customClaims?.[ORGANIZATION_EXTERNAL_IDS_CUSTOM_CLAIM]
          ?.split(',')
          .map((organizationExternalId) => organizationExternalId.trim())
          .filter((organizationExternalId) => organizationExternalId !== '') ?? [],
    };
  },
};
