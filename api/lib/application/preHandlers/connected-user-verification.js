const tokenService = require('../../../lib/domain/services/token-service');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const { UserNotAuthorizedToCertifyError } = require('../../../lib/domain/errors');

module.exports = {
  verifyByToken(request, reply) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);

    return tokenService.verifyValidity(token)
      .then((decodedToken) => reply(decodedToken.user_id))
      .catch(() => {
        const error = new UserNotAuthorizedToCertifyError();
        return reply(validationErrorSerializer.serialize(error.getErrorMessage()))
          .code(401).takeover();
      });
  }
};
