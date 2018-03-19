const logger = require('../../infrastructure/logger');
const tokenService = require('../../domain/services/token-service');
const checkUserIsAuthenticatedUseCase = require('../../application/usecases/checkUserIsAuthenticated');
const checkUserHasRolePixMasterUseCase = require('../../application/usecases/checkUserHasRolePixMaster');
const JSONAPIError = require('jsonapi-serializer').Error;

function _replyWithAuthenticationError(reply) {
  return Promise.resolve().then(() => {
    const errorHttpStatusCode = 401;

    const jsonApiError = new JSONAPIError({
      code: errorHttpStatusCode,
      title: 'Unauthorized access',
      detail: 'Missing or invalid access token in request auhorization headers.'
    });

    return reply(jsonApiError).code(errorHttpStatusCode).takeover();
  });
}

function _replyWithAuthorizationError(reply) {
  return Promise.resolve().then(() => {
    const errorHttpStatusCode = 403;

    const jsonApiError = new JSONAPIError({
      code: errorHttpStatusCode,
      title: 'Forbidden access',
      detail: 'Unauthenticated user or missing role PIX_MASTER.'
    });

    return reply(jsonApiError).code(errorHttpStatusCode).takeover();
  });
}

module.exports = {

  checkUserIsAuthenticated(request, reply) {
    const authorizationHeader = request.headers.authorization;
    const accessToken = tokenService.extractTokenFromAuthChain(authorizationHeader);

    if (!accessToken) {
      return _replyWithAuthenticationError(reply);
    }

    return checkUserIsAuthenticatedUseCase.execute(accessToken)
      .then(authenticatedUser => {
        if (authenticatedUser) {
          return reply.continue({ credentials: { accessToken, userId: authenticatedUser.user_id } });
        }
        return _replyWithAuthenticationError(reply);
      })
      .catch(err => {
        logger.error(err);
        return _replyWithAuthenticationError(reply);
      });
  },

  checkUserHasRolePixMaster(request, reply) {
    if (!request.auth.credentials || !request.auth.credentials.userId) {
      return _replyWithAuthorizationError(reply);
    }

    const userId = request.auth.credentials.userId;

    return checkUserHasRolePixMasterUseCase.execute(userId)
      .then(hasRolePixMaster => {
        if (hasRolePixMaster) {
          return reply(true);
        }
        return _replyWithAuthorizationError(reply);
      })
      .catch(err => {
        logger.error(err);
        return _replyWithAuthorizationError(reply);
      });
  }

};
