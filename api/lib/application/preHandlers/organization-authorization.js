const tokenService = require('../../../lib/domain/services/token-service');
const userRepository = require('../../infrastructure/repositories/user-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

module.exports = {

  async verify(request, h) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const organizationId = request.params.id;

    const user = await userRepository.getWithMemberships(userId);

    if (user.hasRolePixMaster || user.hasAccessToOrganization(organizationId)) {
      return true;
    }

    const buildedError = _dataAuthorizationPayload('Vous n’êtes pas autorisé à accéder aux membres de cette organization');
    return h.response(validationErrorSerializer.serialize(buildedError)).code(403).takeover();
  }
};

function _dataAuthorizationPayload(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}
