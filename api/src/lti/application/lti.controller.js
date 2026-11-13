import { createPublicKey } from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

import { BadRequestError } from '../../shared/application/errors/http-errors.js';
import { cryptoService } from '../../shared/domain/services/crypto-service.js';
import * as urlService from '../../shared/domain/services/url-service.js';
import { httpAgent } from '../../shared/infrastructure/http-agent.js';
import { getI18nFromRequest } from '../../shared/infrastructure/i18n/i18n.js';
import { child, SCOPES } from '../../shared/infrastructure/utils/logger.js';
import { getForwardedOrigin, RequestedApplication } from '../../shared/infrastructure/utils/network.js';
import { LtiLineItemsInitializationError } from '../domain/errors.js';
import { LtiDeepLinkingAccessToken } from '../domain/models/LtiDeepLinkingAccessToken.js';
import { ltiScoringService } from '../domain/services/lti.scoring.service.js';
import { ltiService } from '../domain/services/lti.service.js';
import { usecases } from '../domain/usecases/index.js';
import { ltiPlatformRegistrationRepository } from '../infrastructure/repositories/lti-platform-registration.repository.js';
import { ltiDeepLinkingSerializer } from '../infrastructure/serializers/html/lti-deep-linking-serializer.js';
import { ltiErrorSerializer } from '../infrastructure/serializers/html/lti-error-serializer.js';
import { ltiInitializationSerializer } from '../infrastructure/serializers/html/lti-initialization-serializer.js';
import { ltiRegistrationSerializer } from '../infrastructure/serializers/html/lti-registration-serializer.js';
import { ltiCampaignSerializer } from '../infrastructure/serializers/jsonapi/lti-campaign-serializer.js';

const logger = child('lti:controller', { event: SCOPES.LTI });

const LINE_ITEM_SCOPE = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem';

async function listPublicKeys(request, h, dependencies = { listLtiPublicKeys: usecases.listLtiPublicKeys }) {
  const publicKeys = await dependencies.listLtiPublicKeys();

  return h.response({ keys: publicKeys });
}

async function register(request, h, dependencies = { registerLtiPlatform: usecases.registerLtiPlatform }) {
  const { openid_configuration: platformConfigurationUrl, registration_token: registrationToken } = request.query;

  try {
    await dependencies.registerLtiPlatform({ platformConfigurationUrl, registrationToken });

    return h
      .response(ltiRegistrationSerializer.serialize())
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`);
  } catch (err) {
    logger.warn({ err }, 'registration error');
    return h
      .response(ltiErrorSerializer.serialize({ title: 'Registration error', message: err.message ?? err }))
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(400);
  }
}

async function init(request, h, dependencies = { ltiPlatformRegistrationRepository, httpAgent }) {
  logger.info({ payload: request.payload }, 'Init');

  const {
    client_id: clientId,
    login_hint: loginHint,
    lti_message_hint: ltiMessageHint,
    target_link_uri: targetLinkUri,
  } = request.payload;

  const registration = await dependencies.ltiPlatformRegistrationRepository.findByClientId(clientId);

  if (!registration) {
    logger.warn({ clientId }, 'unknown client id');
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Initialization error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(400);
  }

  if (!registration.isActive) {
    logger.warn({ clientId }, 'registration is not active');
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Initialization error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(400);
  }

  // FIXME check issuer?

  await registration.fetchPlatformOpenIdConfig({ httpAgent: dependencies.httpAgent });

  const state = crypto.randomUUID(); // FIXME should be stateless

  return h
    .response(
      ltiInitializationSerializer.serialize({
        targetLinkUri,
        clientId,
        loginHint,
        ltiMessageHint,
        authorizationEndpoint: registration.authorizationEndpoint,
        nonce: 'FIXME',
        state,
      }),
    )
    .header('Content-Type', 'text/html; charset=utf-8')
    .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`);
}

async function deepLink(request, h, dependencies = { ltiService }) {
  const origin = getForwardedOrigin(request.headers);
  const requestedApplication = RequestedApplication.fromOrigin(origin);

  if (!requestedApplication.isPixOrga) {
    logger.warn('requested application should be PixOrga');
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Deep linking error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(400);
  }

  const { verifiedToken, registration, err } = await preLaunch(request);
  if (err) {
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Deep linking error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(err.status);
  }

  const messageType = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/message_type'];

  if (messageType !== 'LtiDeepLinkingRequest') {
    logger.warn({ messageType }, 'wrong LTI message type');
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Deep linking error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(400);
  }

  const deepLinkingSettings = verifiedToken['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];

  const customClaims = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/custom'];
  const { organizationExternalIds } = dependencies.ltiService.deserializeDeepLinkingCustomClaims(customClaims);

  const ltiDeepLinkingAccessToken = await usecases.authenticateDeepLinking({
    organizationExternalIds,
    registration,
    deepLinkingSettings,
    audience: origin,
  });

  const locale = 'fr-FR'; // TODO: Generate this dynamically
  const campaignSelectionPageUrl = urlService.getPixOrgaUrl(locale, { pathname: '/lti-campaign-selection' });
  return h
    .redirect(campaignSelectionPageUrl)
    .header('Set-Cookie', ltiDeepLinkingAccessToken.encodedForSetCookieHeader)
    .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`);
}

async function findAvailableCampaigns(request, h) {
  const { organizationIds } = request.auth.credentials;
  logger.info({ organizationIds }, 'available campaigns');

  const ltiCampaigns = await usecases.getLtiCampaignsByOrganizations({ organizationIds });

  return h.response(ltiCampaignSerializer.serialize(ltiCampaigns));
}

async function selectCampaign(request, h, dependencies = { ltiService }) {
  const {
    credentials: { organizationIds },
    artifacts: { registration, deepLinkingSettings },
  } = request.auth;

  const i18n = getI18nFromRequest(request);
  const { campaignId } = request.payload;
  const campaign = await usecases.getLtiCampaign({ campaignId });

  if (!organizationIds.includes(campaign?.organizationId)) {
    logger.warn({ campaignId, organizationIds }, 'campaign does not belong to organizations');
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Deep linking error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`)
      .code(400);
  }

  const contentItem = {
    type: 'ltiResourceLink',
    title: campaign.name,
    text: campaign.description ?? i18n.__('lti.profiles-collection-campaign-description'),
    custom: { campaign_id: String(campaign.id), campaign_code: campaign.code },
  };

  const deepLinkingResponse = await dependencies.ltiService.encodeDeepLinkingResponse({
    contentItems: [contentItem],
    registration,
    deepLinkingSettings,
  });

  // FIXME revoke access token's session

  return h
    .response(
      ltiDeepLinkingSerializer.serialize({
        deepLinkingResponse,
        deepLinkingReturnUrl: deepLinkingSettings.deep_link_return_url,
      }),
    )
    .header('Content-Type', 'text/html; charset=utf-8')
    .header('Set-Cookie', LtiDeepLinkingAccessToken.setCookieHeaderForClearing())
    .header('Content-Security-Policy', `frame-ancestors ${request.info.referrer}`);
}

async function resourceLink(request, h, dependencies = { urlService, ltiScoringService }) {
  const { verifiedToken, registration } = await preLaunch(request);
  const messageType = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/message_type'];

  if (messageType !== 'LtiResourceLinkRequest') {
    throw new BadRequestError(`Wrong messageType, should be "LtiResourceLinkRequest" but was "${messageType}"`);
  }

  const campaignId = Number(verifiedToken['https://purl.imsglobal.org/spec/lti/claim/custom']?.campaign_id);
  const campaign = Number.isInteger(campaignId) ? await usecases.getLtiCampaign({ campaignId }) : null;

  if (!campaign) {
    logger.warn({ campaignId }, 'unknown campaign');
    throw new BadRequestError('Please contact your administrator', 'LAUNCH_ERROR');
  }

  const accessToken = await getAccessToken(LINE_ITEM_SCOPE, registration);
  if (!accessToken) {
    logger.error({ campaignId }, 'could not get access token to initialize line items');
    return launchErrorResponse(h);
  }

  try {
    await dependencies.ltiScoringService.initializeLineItems({
      lineItemsUrl: verifiedToken['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']?.lineitems,
      resourceLinkId: verifiedToken['https://purl.imsglobal.org/spec/lti/claim/resource_link']?.id,
      campaign,
      accessToken,
    });
  } catch (err) {
    if (!(err instanceof LtiLineItemsInitializationError)) throw err;

    logger.error({ campaignId, err }, 'could not initialize line items');
    return launchErrorResponse(h);
  }

  const locale = 'fr-FR'; // TODO: Generate this dynamically

  const campaignUrl = dependencies.urlService.getPixAppUrl(locale, { pathname: `/campagnes/${campaign.code}` });

  return h.redirect(campaignUrl);
}

export const ltiController = {
  listPublicKeys,
  register,
  init,
  deepLink,
  findAvailableCampaigns,
  selectCampaign,
  resourceLink,
};

async function preLaunch(request, dependencies = { ltiPlatformRegistrationRepository, httpAgent }) {
  const encodedToken = request.payload.id_token;

  const decodedToken = jsonwebtoken.decode(encodedToken, { complete: true });

  logger.info({ decodedToken }, 'Launch');

  const { aud: clientId } = decodedToken.payload;

  const registration = await dependencies.ltiPlatformRegistrationRepository.findByClientId(clientId);

  if (!registration) {
    logger.warn({ clientId }, 'unknown client id');
    return { err: new BadRequestError() };
  }

  if (!registration.isActive) {
    logger.warn({ clientId }, 'registration is not active');
    return { err: new BadRequestError() };
  }

  await registration.fetchPlatformOpenIdConfig({ httpAgent: dependencies.httpAgent });

  const { keys } = await registration.fetchJwks({ httpAgent: dependencies.httpAgent });

  const key = keys.find(({ kid }) => kid === decodedToken.header.kid);

  if (key === undefined) {
    logger.warn({ kid: decodedToken.header.kid }, 'could not find key');
    return { err: new BadRequestError() };
  }

  const verifiedToken = jsonwebtoken.verify(encodedToken, createPublicKey({ key, format: 'jwk' }));

  return { verifiedToken, registration };
}

function launchErrorResponse(h) {
  return h
    .response(ltiErrorSerializer.serialize({ title: 'Launch error', message: 'Please contact your administrator' }))
    .header('Content-Type', 'text/html; charset=utf-8')
    .code(502);
}

async function getAccessToken(scope, registration, dependencies = { cryptoService }) {
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

  const res = await fetch(registration.platformOpenIdConfig.token_endpoint, {
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

  if (!res.ok) {
    logger.error({ status: res.status, err: await res.text() }, 'could not get access token');
    return null;
  }

  return res.json();
}
