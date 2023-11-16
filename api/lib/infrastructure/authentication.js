import lodash from 'lodash';

const { find } = lodash;

import boom from '@hapi/boom';

import { tokenService } from '../../src/shared/domain/services/token-service.js';
import { config } from '../../lib/config.js';

async function _checkIsAuthenticated(request, h, { key, validate }) {
  if (!request.headers.authorization) {
    return boom.unauthorized(null, 'jwt');
  }

  const authorizationHeader = request.headers.authorization;
  const accessToken = tokenService.extractTokenFromAuthChain(authorizationHeader);

  if (!accessToken) {
    return boom.unauthorized();
  }

  const decodedAccessToken = tokenService.getDecodedToken(accessToken, key);
  if (decodedAccessToken) {
    const { isValid, credentials, errorCode } = validate(decodedAccessToken, request, h);
    if (isValid) {
      return h.authenticated({ credentials });
    }

    if (errorCode === 403) {
      return boom.forbidden();
    }
  }

  return boom.unauthorized();
}

function validateUser(decoded) {
  return { isValid: true, credentials: { userId: decoded.user_id } };
}

function validateClientApplication(decoded) {
  const application = find(config.apimRegisterApplicationsCredentials, { clientId: decoded.client_id });

  if (!application) {
    return { isValid: false, errorCode: 401 };
  }

  if (decoded.scope !== application.scope) {
    return { isValid: false, errorCode: 403 };
  }

  return { isValid: true, credentials: { client_id: decoded.clientId, scope: decoded.scope, source: decoded.source } };
}

const authentication = {
  schemeName: 'jwt-scheme',

  scheme(_, { key, validate }) {
    return { authenticate: (request, h) => _checkIsAuthenticated(request, h, { key, validate }) };
  },

  strategies: [
    {
      name: 'jwt-user',
      configuration: {
        key: config.authentication.secret,
        validate: validateUser,
      },
    },
    {
      name: 'jwt-livret-scolaire',
      configuration: {
        key: config.jwtConfig.livretScolaire.secret,
        validate: validateClientApplication,
      },
    },
    {
      name: 'jwt-pole-emploi',
      configuration: {
        key: config.jwtConfig.poleEmploi.secret,
        validate: validateClientApplication,
      },
    },
  ],

  defaultStrategy: 'jwt-user',
};

export { authentication };
