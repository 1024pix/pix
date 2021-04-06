const tokenService = require('../domain/services/token-service');
const boom = require('boom');

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

module.exports = {

  scheme(_, { key, validate }) {
    return { authenticate: (request, h) => _checkIsAuthenticated(request, h, { key, validate }) };
  },

};
