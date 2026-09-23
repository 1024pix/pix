import { usecases } from '../../domain/usecases/index.js';
import { ltiErrorSerializer } from '../../infrastructure/serializers/html/lti-error-serializer.js';
import { ltiRegistrationSerializer } from '../../infrastructure/serializers/html/lti-registration-serializer.js';

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

export const ltiController = { listPublicKeys, register };
