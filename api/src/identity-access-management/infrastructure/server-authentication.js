import boom from '@hapi/boom';

import { config } from '../../shared/config.js';
import { tokenService } from '../../shared/domain/services/token-service.js';
import {
  jwtApplicationAuthenticationStrategyName,
  jwtUserAuthenticationStrategyName,
} from '../../shared/infrastructure/authentication-strategy-names.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';
import { revokedUserAccessRepository } from '../infrastructure/repositories/revoked-user-access.repository.js';
import { getForwardedOrigin } from '../infrastructure/utils/network.js';

const schemes = {
  jwt: {
    name: 'jwt-scheme',
    scheme(_, strategyConfiguration) {
      return {
        authenticate: authenticateJWT(strategyConfiguration),
      };
    },
  },
};

const strategies = {
  jwtUser: {
    name: jwtUserAuthenticationStrategyName,
    schemeName: schemes.jwt.name,
    configuration: {
      key: config.authentication.secret,
      validate: (decodedAccessToken, options) =>
        validateUser(decodedAccessToken, { ...options, revokedUserAccessRepository }),
    },
  },

  jwtApplication: {
    name: jwtApplicationAuthenticationStrategyName,
    schemeName: schemes.jwt.name,
    configuration: {
      key: config.authentication.secret,
      validate: validateClientApplication,
    },
  },
};

async function validateUser(decodedAccessToken, { request, revokedUserAccessRepository }) {
  const userId = decodedAccessToken.user_id;
  if (!userId) {
    return { isValid: false };
  }

  const revokedUserAccess = await revokedUserAccessRepository.findByUserId(userId);
  if (revokedUserAccess.isAccessTokenRevoked(decodedAccessToken)) {
    logger.warn({
      message: 'Revoked user AccessToken usage',
      decodedAccessToken,
    });

    return { isValid: false };
  }

  const audience = getForwardedOrigin(request.headers);
  if (decodedAccessToken.aud !== audience) {
    logger.warn({
      message: 'User AccessToken audience mismatch',
      audience,
      decodedAccessToken,
    });

    return { isValid: false };
  }

  return { isValid: true, credentials: { userId: decodedAccessToken.user_id } };
}

async function validateClientApplication(decodedAccessToken) {
  if (!decodedAccessToken.client_id) {
    return { isValid: false };
  }

  return {
    isValid: true,
    credentials: {
      client_id: decodedAccessToken.client_id,
      scope: decodedAccessToken.scope.split(/\s/g),
      source: decodedAccessToken.source,
    },
  };
}

function authenticateJWT({ key, validate }) {
  return async (request, h) => {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return boom.unauthorized(null, 'jwt');
    }

    const accessToken = tokenService.extractTokenFromAuthChain(authorizationHeader);
    if (!accessToken) {
      return boom.unauthorized();
    }

    const decodedAccessToken = tokenService.getDecodedToken(accessToken, key);
    if (!decodedAccessToken) {
      return boom.unauthorized();
    }

    const { isValid, credentials, errorCode } = await validate(decodedAccessToken, { request, h });
    if (isValid) {
      return h.authenticated({ credentials });
    }

    if (errorCode === 403) {
      return boom.forbidden();
    }

    return boom.unauthorized();
  };
}

export { schemes, strategies, validateClientApplication, validateUser };
