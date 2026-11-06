import jsonwebtoken from 'jsonwebtoken';

import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as urlService from '../../../shared/domain/services/url-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { getI18n } from '../../../shared/infrastructure/i18n/i18n.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { ltiPlatformRepository } from '../../infrastructure/repositories/lti-platform.repository.js';
import { InvalidLtiPlatformRegistrationError, LtiLineItemsInitializationError } from '../errors.js';
import { validatePlatformConfiguration } from '../validators/platform-configuration.validator.js';

const logger = child('lti:service', { event: SCOPES.LTI });

const ORGANIZATION_EXTERNAL_IDS_CUSTOM_CLAIM = 'pix_orgas';

const LINE_ITEM_SCOPE = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem';
const LINE_ITEM_CONTENT_TYPE = 'application/vnd.ims.lis.v2.lineitem+json';
const LINE_ITEMS_LOCALE = 'fr';
const LINE_ITEMS_QUERY_LIMIT = 1000;
const MASTERY_RATE_SCORE_MAXIMUM = 100;
const PIX_SCORE_MAXIMUM = 1024;

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

  /**
   * Creates on the platform the line items matching the campaign, skipping those that already exist.
   * Existing line items are looked up on the platform (by tag, then by resourceId), so calling this
   * method several times for the same campaign never creates duplicates.
   *
   * @param {object} args
   * @param {string} args.lineItemsUrl AGS line items container URL
   * @param {import('../models/LtiCampaign.js').LtiCampaign} args.campaign
   * @param {import('../models/LtiPlatformRegistration.js').LtiPlatformRegistration} args.registration
   * @throws {LtiLineItemsInitializationError}
   */
  async initializeLineItems(
    { lineItemsUrl, campaign, registration },
    dependencies = { cryptoService, getI18n, httpAgent },
  ) {
    if (!lineItemsUrl) {
      throw new LtiLineItemsInitializationError('Missing line items URL');
    }

    const accessToken = await getAccessToken(LINE_ITEM_SCOPE, registration, dependencies);
    const headers = { Authorization: `${accessToken.token_type} ${accessToken.access_token}` };

    const tag = buildLineItemsTag(campaign);
    const existingResourceIds = await findExistingResourceIds({ lineItemsUrl, tag, headers }, dependencies);

    const expectedLineItems = buildExpectedLineItems(campaign, dependencies.getI18n(LINE_ITEMS_LOCALE));
    const missingLineItems = expectedLineItems.filter(({ resourceId }) => !existingResourceIds.has(resourceId));

    await PromiseUtils.mapSeries(missingLineItems, async (lineItem) => {
      const response = await dependencies.httpAgent.post({
        url: lineItemsUrl,
        payload: lineItem,
        headers: { ...headers, 'Content-Type': LINE_ITEM_CONTENT_TYPE },
      });
      if (!response.isSuccessful) {
        logger.error(
          { lineItemsUrl, resourceId: lineItem.resourceId, code: response.code },
          'could not create line item',
        );
        throw new LtiLineItemsInitializationError('Could not create line item');
      }
    });
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

function buildLineItemsTag(campaign) {
  return `pix-campaign-${campaign.id}`;
}

function buildExpectedLineItems(campaign, i18n) {
  const tag = buildLineItemsTag(campaign);
  const resourceIdPrefix = `pix:campaign:${campaign.id}`;

  const competenceLineItems = campaign.competences.map((competence) => ({
    label: `${competence.index} ${competence.name}`,
    resourceId: `${resourceIdPrefix}:competence:${competence.id}`,
    scoreMaximum: Math.round(competence.maxLevel),
    tag,
  }));

  const globalLineItem = buildGlobalLineItem({ campaignType: campaign.type, resourceIdPrefix, tag, i18n });

  return globalLineItem ? [...competenceLineItems, globalLineItem] : competenceLineItems;
}

function buildGlobalLineItem({ campaignType, resourceIdPrefix, tag, i18n }) {
  switch (campaignType) {
    case 'ASSESSMENT':
    case 'EXAM':
      return {
        label: i18n.__('lti.line-item-mastery-rate'),
        resourceId: `${resourceIdPrefix}:mastery-rate`,
        scoreMaximum: MASTERY_RATE_SCORE_MAXIMUM,
        tag,
      };
    case 'PROFILES_COLLECTION':
      return {
        label: i18n.__('lti.line-item-pix-score'),
        resourceId: `${resourceIdPrefix}:pix-score`,
        scoreMaximum: PIX_SCORE_MAXIMUM,
        tag,
      };
    default:
      return null;
  }
}

async function findExistingResourceIds({ lineItemsUrl, tag, headers }, dependencies) {
  const url = new URL(lineItemsUrl);
  url.searchParams.set('tag', tag);
  url.searchParams.set('limit', String(LINE_ITEMS_QUERY_LIMIT));

  const response = await dependencies.httpAgent.get({
    url: url.toString(),
    headers: { ...headers, Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json' },
  });

  if (!response.isSuccessful || !Array.isArray(response.data)) {
    logger.error({ lineItemsUrl, code: response.code }, 'could not list line items');
    throw new LtiLineItemsInitializationError('Could not list line items');
  }

  return new Set(response.data.map(({ resourceId }) => resourceId));
}

async function getAccessToken(scope, registration, dependencies) {
  const privateKey = {
    format: 'jwk',
    key: JSON.parse(await dependencies.cryptoService.decrypt(registration.encryptedPrivateKey)),
  };

  const client_assertion = jsonwebtoken.sign(
    {
      iss: registration.platformIssuer,
      sub: registration.clientId,
      aud: registration.platformOpenIdConfig.token_endpoint,
    },
    privateKey,
    {
      expiresIn: 3600,
      algorithm: 'RS256',
      keyid: registration.publicKey.kid,
    },
  );

  const response = await fetch(registration.platformOpenIdConfig.token_endpoint, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion,
      scope,
    }),
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    logger.error({ status: response.status, err: await response.text() }, 'could not get access token');
    throw new LtiLineItemsInitializationError('Could not get access token');
  }

  return response.json();
}
