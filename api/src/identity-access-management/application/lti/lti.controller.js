import { config } from '../../../../config/config.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { child } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../../domain/usecases/index.js';
import { ltiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
import { ltiErrorSerializer } from '../../infrastructure/serializers/html/lti-error-serializer.js';
import { ltiInitializationSerializer } from '../../infrastructure/serializers/html/lti-initialization-serializer.js';
import { ltiRegistrationSerializer } from '../../infrastructure/serializers/html/lti-registration-serializer.js';

const logger = child('lti', { event: 'lti' });

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

export const ltiController = { listPublicKeys, register, init };
