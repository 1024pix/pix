const tokenService = require('../../../lib/domain/services/token-service');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

module.exports = {
  verify(request, reply) {
    const token = request.query.userToken;
    const userId = tokenService.extractUserId(token);
    const organizationId = request.params.id;

    return organizationRepository
      .getByUserId(userId)
      .then((organizations) => organizations.some((organization) => organization.get('id') == organizationId))
      .then((organizationFound) => organizationFound ? Promise.resolve() : Promise.reject())
      .then(reply)
      .catch(() => {
        const buildedError = _dataAuthorizationPayload('Vous n’êtes pas autorisé à accéder à ces profils partagés');
        return reply(validationErrorSerializer.serialize(buildedError)).code(401).takeover();
      });
  }
};

function _dataAuthorizationPayload(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}
