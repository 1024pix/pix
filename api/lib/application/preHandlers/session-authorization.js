const sessionAuthorizationService = require('../../domain/services/session-authorization-service');
const { NotFoundError } = require('../../application/errors');

module.exports = {
  async verify(request) {
    const userId = request.auth.credentials.userId;
    const sessionId = parseInt(request.params.id);

    const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

    if (!isAuthorized) {
      throw new NotFoundError('La session n\'existe pas ou son accès est restreint');
    }

    return isAuthorized;
  }
};
