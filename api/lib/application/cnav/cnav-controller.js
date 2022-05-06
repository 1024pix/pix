const cnavAuthenticationService = require('../../../lib/domain/services/authentication/cnav-authentication-service');

module.exports = {
  async getAuthUrl(request, h) {
    const result = cnavAuthenticationService.getAuthUrl({
      redirectUri: request.query['redirect_uri'],
    });
    return h.response(result).code(200);
  },
};
