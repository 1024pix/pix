const usecases = require('../../domain/usecases');
const tokenService = require('../../domain/services/token-service');
const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {
  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId } = await usecases.createUserFromNeo({ authenticationKey });

    const accessToken = tokenService.createAccessTokenForNeo(userId);
    await userRepository.updateLastLoggedAt({ userId });

    const response = {
      access_token: accessToken
    };
    return h.response(response).code(200);
  },
};
