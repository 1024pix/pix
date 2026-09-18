import { createPublicKey } from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../config/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { child } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../../domain/usecases/index.js';
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { ltiDeepLinkingSerializer } from '../../infrastructure/serializers/html/lti-deep-linking-serializer.js';
import { ltiErrorSerializer } from '../../infrastructure/serializers/html/lti-error-serializer.js';
import { ltiInitializationSerializer } from '../../infrastructure/serializers/html/lti-initialization-serializer.js';
import { ltiRegistrationSerializer } from '../../infrastructure/serializers/html/lti-registration-serializer.js';

const logger = child('lti', { event: 'lti' });

async function listPublicKeys(request, h, dependencies = { listLtiPublicKeys: usecases.listLtiPublicKeys }) {
  const publicKeys = await dependencies.listLtiPublicKeys();

  return h.response(publicKeys);
}

async function register(request, h, dependencies = { registerLtiPlatform: usecases.registerLtiPlatform }) {
  const { openid_configuration: platformConfigurationUrl, registration_token: registrationToken } = request.query;

  try {
    const registration = await dependencies.registerLtiPlatform({ platformConfigurationUrl, registrationToken });

    return h
      .response(ltiRegistrationSerializer.serialize())
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Content-Security-Policy', `frame-ancestors ${registration.platformOrigin}`);
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

  const { client_id: clientId, login_hint: loginHint, lti_message_hint: ltiMessageHint } = request.payload;

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
        baseUrl: config.baseUrl,
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

async function launch(request, h, dependencies = { ltiPlatformRegistrationRepository, httpAgent }) {
  const encodedToken = request.payload.id_token;

  const decodedToken = jsonwebtoken.decode(encodedToken, { complete: true });

  logger.info({ decodedToken }, 'Launch');

  const { aud: clientId } = decodedToken.payload;

  const registration = await dependencies.ltiPlatformRegistrationRepository.findByClientId(clientId);

  if (!registration) {
    logger.warn({ clientId }, 'unknown client id');
    return h
      .response(ltiErrorSerializer.serialize({ title: 'Launch error', message: 'Please contact your administrator' }))
      .header('Content-Type', 'text/html; charset=utf-8')
      .code(400);
  }

  if (!registration.isActive) {
    logger.warn({ clientId }, 'registration is not active');
    return h
      .response(ltiErrorSerializer.serialize({ title: 'Launch error', message: 'Please contact your administrator' }))
      .header('Content-Type', 'text/html; charset=utf-8')
      .code(400);
  }

  await registration.fetchPlatformOpenIdConfig({ httpAgent: dependencies.httpAgent });

  const { keys } = await registration.fetchJwks({ httpAgent: dependencies.httpAgent });

  const key = keys.find(({ kid }) => kid === decodedToken.header.kid);
  if (key === undefined) {
    logger.warn({ kid: decodedToken.header.kid }, 'could not find key');
  }

  const verifiedToken = jsonwebtoken.verify(encodedToken, createPublicKey({ key, format: 'jwk' }));

  const messageType = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/message_type'];

  if (messageType === 'LtiResourceLinkRequest') {
    const targetLinkUri = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'];

    // scoreUrl = new URL(verifiedToken['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitem);
    // scoreUrl.pathname += '/scores';
    // scoreUrl = scoreUrl.href;
    // userId = verifiedToken.sub;

    return h.redirect(targetLinkUri);
  }

  if (messageType === 'LtiDeepLinkingRequest') {
    const deepLinkUrl =
      verifiedToken['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'].deep_link_return_url;

    const response = await encodeDeepLinkingResponse(verifiedToken, deepLinkUrl, registration);

    return h
      .response(ltiDeepLinkingSerializer.serialize({ deepLinkUrl, response }))
      .header('Content-Type', 'text/html; charset=utf-8');
  }
}

async function encodeDeepLinkingResponse(request, deepLinkUrl, registration, dependencies = { cryptoService }) {
  const privateKey = {
    format: 'jwk',
    key: JSON.parse(await dependencies.cryptoService.decrypt(registration.encryptedPrivateKey)),
  };

  return jsonwebtoken.sign(
    {
      iss: registration.clientId,
      aud: deepLinkUrl,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        request['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [
        {
          type: 'ltiResourceLink',
          title: 'Campagne Pix',
          text: 'Campagne PIX dont la note sera envoyée dans Moodle',
          url: 'http://localhost:4200/campagnes/CONTEN123',
          lineItem: {
            scoreMaximum: 100,
          },
        },
      ],
    },
    privateKey,
    {
      expiresIn: 3600,
      algorithm: 'RS256',
      keyid: registration.publicKey.kid,
    },
  );
}

export const ltiController = { listPublicKeys, register, init, launch };
