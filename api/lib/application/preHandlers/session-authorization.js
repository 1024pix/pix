const { NotFoundError } = require('../http-errors');
const sessionAuthorizationService = require('../../domain/services/session-authorization-service');

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
