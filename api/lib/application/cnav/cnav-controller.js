const cnavAuthenticationService = require('../../../lib/domain/services/authentication/cnav-authentication-service');
const usecases = require('../../domain/usecases');
const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {
  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const userId = await usecases.createUserFromCnav({ authenticationKey });

    const accessToken = cnavAuthenticationService.createAccessToken(userId);
    await userRepository.updateLastLoggedAt({ userId });

    const response = { access_token: accessToken };
    return h.response(response).code(200);
  },

  async getAuthUrl(request, h) {
    const result = cnavAuthenticationService.getAuthUrl({
      redirectUri: request.query['redirect_uri'],
    });
    return h.response(result).code(200);
  },
};
