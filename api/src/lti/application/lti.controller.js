import { createPublicKey } from 'node:crypto';

import boom from '@hapi/boom';
import jsonwebtoken from 'jsonwebtoken';

import { BadRequestError } from '../../shared/application/errors/http-errors.js';
import { cryptoService } from '../../shared/domain/services/crypto-service.js';
import * as urlService from '../../shared/domain/services/url-service.js';
import { httpAgent } from '../../shared/infrastructure/http-agent.js';
import { child, SCOPES } from '../../shared/infrastructure/utils/logger.js';
import { getForwardedOrigin, RequestedApplication } from '../../shared/infrastructure/utils/network.js';
import { LtiDeepLinkingAccessToken } from '../domain/models/LtiDeepLinkingAccessToken.js';
import { ltiService } from '../domain/services/lti.service.js';
import { usecases } from '../domain/usecases/index.js';
import { ltiPlatformRegistrationRepository } from '../infrastructure/repositories/lti-platform-registration.repository.js';
import { ltiDeepLinkingSerializer } from '../infrastructure/serializers/html/lti-deep-linking-serializer.js';
import { ltiErrorSerializer } from '../infrastructure/serializers/html/lti-error-serializer.js';
import { ltiInitializationSerializer } from '../infrastructure/serializers/html/lti-initialization-serializer.js';
import { ltiRegistrationSerializer } from '../infrastructure/serializers/html/lti-registration-serializer.js';
import { ltiCampaignSerializer } from '../infrastructure/serializers/jsonapi/lti-campaign-serializer.js';

const logger = child('lti:controller', { event: SCOPES.LTI });

async function listPublicKeys(request, h, dependencies = { listLtiPublicKeys: usecases.listLtiPublicKeys }) {
  const publicKeys = await dependencies.listLtiPublicKeys();

  return h.response({ keys: publicKeys });
}

async function register(request, h, dependencies = { registerLtiPlatform: usecases.registerLtiPlatform }) {
  const { openid_configuration: platformConfigurationUrl, registration_token: registrationToken } = request.query;

  try {
    const registration = await dependencies.registerLtiPlatform({ platformConfigurationUrl, registrationToken });

    return h
      .response(ltiRegistrationSerializer.serialize())
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${registration.platformIssuer}`);
  } catch (err) {
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
      .code(400);
  }

  if (!registration.isActive) {
    logger.warn({ clientId }, 'registration is not active');
    return h
      .response(
        ltiErrorSerializer.serialize({ title: 'Initialization error', message: 'Please contact your administrator' }),
      )
      .header('Content-Type', 'text/html; charset=utf-8')
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
    .header('Content-Type', 'text/html; charset=utf-8');
}

async function deepLink(request, h, dependencies = { ltiService }) {
  const { verifiedToken, registration } = await preLaunch(request);

  const origin = getForwardedOrigin(request.headers);
  const requestApplication = RequestedApplication.fromOrigin(origin);
  if (!requestApplication.isPixOrga) {
    return boom.preconditionFailed();
  }

  const messageType = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/message_type'];

  // FIXME return 400 bad request if !=
  if (messageType === 'LtiDeepLinkingRequest') {
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
      .header('Set-Cookie', ltiDeepLinkingAccessToken.encodedForSetCookieHeader);
  }
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

  const { campaignId } = request.payload;
  const campaign = await usecases.getLtiCampaign({ campaignId });

  if (!organizationIds.includes(campaign?.organizationId)) {
    logger.warn({ campaignId, organizationIds }, 'campaign does not belongs to organizations');
    return boom.badRequest();
  }

  const contentItem = {
    type: 'ltiResourceLink',
    title: campaign.name,
    // fixme: rajoute le bon wording pour les campagnes de collecte de profils
    text: campaign.description || 'Collecte de profils',
    custom: { campaign_code: campaign.code },
    lineItem: {
      scoreMaximum: 100,
    },
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
    .header('Set-Cookie', LtiDeepLinkingAccessToken.setCookieHeaderForClearing());
}

async function resourceLink(request, h, dependencies = { urlService }) {
  const { verifiedToken, registration } = await preLaunch(request);

  const messageType = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/message_type'];

  // FIXME return 400 bad request if !=
  if (messageType === 'LtiResourceLinkRequest') {
    await sendScoring(verifiedToken, registration);

    const campaignCode = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/custom'].campaign_code;

    const campaignUrl = dependencies.urlService.getPixAppUrl('fr-FR', { pathname: `/campagnes/${campaignCode}` });

    return h.redirect(campaignUrl);
  }
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
    throw new BadRequestError('Please contact your administrator', 'LAUNCH_ERROR');
  }

  if (!registration.isActive) {
    logger.warn({ clientId }, 'registration is not active');
    throw new BadRequestError('Please contact your administrator', 'LAUNCH_ERROR');
  }

  await registration.fetchPlatformOpenIdConfig({ httpAgent: dependencies.httpAgent });

  const { keys } = await registration.fetchJwks({ httpAgent: dependencies.httpAgent });

  const key = keys.find(({ kid }) => kid === decodedToken.header.kid);
  if (key === undefined) {
    logger.warn({ kid: decodedToken.header.kid }, 'could not find key');
  }

  const verifiedToken = jsonwebtoken.verify(encodedToken, createPublicKey({ key, format: 'jwk' }));

  return { verifiedToken, registration };
}

async function sendScoring(request, registration) {
  const scoringServiceAccessToken = await getAccessToken(
    'https://purl.imsglobal.org/spec/lti-ags/scope/score',
    registration,
  );
  if (!scoringServiceAccessToken) return;

  const scoringServiceUrl = new URL(request['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitem);
  scoringServiceUrl.pathname += '/scores';

  const scoringPayload = {
    scoreGiven: 83,
    scoreMaximum: 100,
    comment: 'This is exceptional work.',
    activityProgress: 'Completed',
    gradingProgress: 'FullyGraded',
    timestamp: new Date().toISOString(),
    userId: request.sub,
  };

  const scoringRes = await fetch(scoringServiceUrl, {
    method: 'POST',
    headers: {
      Authorization: scoringServiceAccessToken.token_type + ' ' + scoringServiceAccessToken.access_token,
      'Content-Type': 'application/vnd.ims.lis.v1.score+json',
    },
    body: JSON.stringify(scoringPayload),
  });

  if (scoringRes.ok) {
    logger.info({ payload: await scoringRes.text() }, 'scoring ok');
  } else {
    logger.error({ status: scoringRes.status, err: await scoringRes.text() }, 'could not send scoring');
  }
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
