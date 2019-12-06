const sessionAuthorizationService = require('../../domain/services/session-authorization-service');
const { ForbiddenError } = require('../../infrastructure/errors');

module.exports = {
  async verify(request) {
    const userId = request.auth.credentials.userId;
    const sessionId = parseInt(request.params.id);

    const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

    if (!isAuthorized) {
      throw new ForbiddenError('Vous n\'êtes pas autorisé à accéder à cette session.');
    }

    return isAuthorized;
  }
};
