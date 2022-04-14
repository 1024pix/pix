const usecases = require('../../domain/usecases');
const tokenService = require('../../domain/services/token-service');
const userRepository = require('../../infrastructure/repositories/user-repository');
const authenticationService = require('../../../lib/domain/services/authentication-service');

module.exports = {
  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId, idToken } = await usecases.createUserFromCnav({ authenticationKey });

    const accessToken = tokenService.createAccessTokenForCnav(userId);
    await userRepository.updateLastLoggedAt({ userId });

    const response = {
      access_token: accessToken,
      id_token: idToken,
    };
    return h.response(response).code(200);
  },

  async getAuthUrl(request, h) {
    const result = authenticationService.getCnavAuthUrl({
      redirectUri: request.query['redirect_uri'],
    });
    return h.response(result).code(200);
  },
};
