const usecases = require('../../domain/usecases');
const tokenService = require('../../domain/services/token-service');
const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {

  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId, idToken } = await usecases.createUserFromPoleEmploi({ authenticationKey });

    const accessToken = tokenService.createAccessTokenFromUser(userId, 'pole_emploi_connect');
    await userRepository.updateLastLoggedAt({ userId });

    const response = {
      access_token: accessToken,
      id_token: idToken,
    };
    return h.response(response).code(200);
  },

  async getSendings(request, h) {
    const cursor = request.query.curseur;
    const filters = _extractFilters(request);
    const { sendings, link } = await usecases.getPoleEmploiSendings({ cursor, filters });
    return h.response(sendings).header('link', link).code(200);
  },
};

function _extractFilters(request) {
  const filters = {};
  if (Object.keys(request.query).includes('enErreur')) {
    filters.isSuccessful = !request.query.enErreur;
  }
  return filters;
}
