import boom from '@hapi/boom';

import { logger } from '../../shared/infrastructure/utils/logger.js';
import { LtiPrescriberAccessToken } from '../domain/models/LtiPrescriberAccessToken.js';
import { ltiPlatformRegistrationRepository } from './repositories/lti-platform-registration.repository.js';

export const jwtCookieSchemeName = 'jwt-cookie';

export function jwtCookieScheme(_, strategyConfiguration) {
  return {
    authenticate: makeAuthenticateJwtCookie(strategyConfiguration),
  };
}

function makeAuthenticateJwtCookie({ cookieName, decode, authenticatePayload }) {
  return async function authenticateJwtCookie(request, h) {
    const cookies = Object.fromEntries(request.headers.cookie?.split('; ').map((cookie) => cookie.split('=')) ?? []); // TODO : use a lib here
    if (!cookies[cookieName]) {
      logger.warn({
        message: 'request has no cookie',
        cookieName,
      });

      return boom.unauthorized(null, jwtCookieSchemeName);
    }

    const payload = decode(cookies[cookieName]);

    return authenticatePayload(payload, h);
  };
}

export const ltiPrescriberStrategyName = 'lti-prescriber';

export const ltiPrescriberStrategyConfiguration = {
  cookieName: 'jwtLtiPrescriber',
  decode: LtiPrescriberAccessToken.decode,
  authenticatePayload: authenticateLtiPrescriberPayload,
};

/**
 * @param {LtiPrescriberAccessToken} payload
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
async function authenticateLtiPrescriberPayload(payload, h) {
  const { clientId, organizationIds, deepLinkingResponseEndpoint } = payload;

  const registration = await ltiPlatformRegistrationRepository.findByClientId(clientId);

  if (!registration) {
    logger.warn({ clientId }, 'unknown client id');
    return h.unauthenticated(boom.unauthorized());
  }

  if (!registration.isActive) {
    logger.warn({ clientId }, 'registration is not active');
    return h.unauthenticated(boom.unauthorized());
  }

  return h.authenticated({
    credentials: {
      organizationIds,
    },
    artifacts: {
      registration,
      deepLinkingResponseEndpoint,
    },
  });
}
