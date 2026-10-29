import boom from '@hapi/boom';
import { parseCookie } from 'cookie';

import { logger } from '../../shared/infrastructure/utils/logger.js';
import { getForwardedOrigin } from '../../shared/infrastructure/utils/network.js';
import { LtiDeepLinkingAccessToken } from '../domain/models/LtiDeepLinkingAccessToken.js';
import { ltiPlatformRegistrationRepository } from './repositories/lti-platform-registration.repository.js';

export const jwtCookieSchemeName = 'jwt-cookie';

export function jwtCookieScheme(_, strategyConfiguration) {
  return {
    authenticate: makeAuthenticateJwtCookie(strategyConfiguration),
  };
}

function makeAuthenticateJwtCookie({ cookieName, decode, authenticatePayload }) {
  return async function authenticateJwtCookie(request, h) {
    const cookies = parseCookie(request.headers.cookie);
    if (!cookies[cookieName]) {
      logger.warn({
        message: 'request has no cookie',
        cookieName,
      });

      return boom.unauthorized(null, jwtCookieSchemeName);
    }

    let payload;
    try {
      payload = decode(cookies[cookieName], request);
    } catch {
      return boom.unauthorized();
    }

    // FIXME check token's session isn't revoked

    return authenticatePayload(payload, h);
  };
}

export const ltiPrescriberStrategyName = 'lti-prescriber';

export const ltiPrescriberStrategyConfiguration = {
  cookieName: LtiDeepLinkingAccessToken.cookieName,
  decode: decodeLtiDeepLinkingAccessToken,
  authenticatePayload: authenticateLtiPrescriberPayload,
};

/**
 * @param {string} value
 * @param {import('@hapi/hapi').Request} request
 */
function decodeLtiDeepLinkingAccessToken(value, request) {
  const expectedAudience = getForwardedOrigin(request.headers);
  return LtiDeepLinkingAccessToken.decode(value, { expectedAudience });
}

/**
 * @param {LtiDeepLinkingAccessToken} payload
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
async function authenticateLtiPrescriberPayload(payload, h) {
  const { clientId, organizationIds, deepLinkingSettings } = payload;

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
      deepLinkingSettings,
    },
  });
}
