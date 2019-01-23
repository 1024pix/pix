const tokenService = require('../../../lib/domain/services/token-service');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');

module.exports = {
  verify(request, h) {
    const token = request.query.userToken || tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const organizationId = request.params.id || extractParameters(request.query).filter.organizationId;

    return organizationRepository
      .getByUserId(userId)
      .then((organizations) => organizations.some((organization) => organization.get('id') == organizationId))
      .then((organizationFound) => organizationFound ? null : Promise.reject())
      .catch(() => {
        const buildedError = _dataAuthorizationPayload('Vous n’êtes pas autorisé à accéder à ces profils partagés');
        return h.response(validationErrorSerializer.serialize(buildedError)).code(401).takeover();
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
