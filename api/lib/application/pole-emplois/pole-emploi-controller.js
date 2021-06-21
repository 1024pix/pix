const usecases = require('../../domain/usecases');
const tokenService = require('../../domain/services/token-service');
module.exports = {

  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId, idToken } = await usecases.createUserFromPoleEmploi({ authenticationKey });

    const accessToken = tokenService.createAccessTokenFromUser(userId, 'pole_emploi_connect');

    const response = {
      access_token: accessToken,
      id_token: idToken,
    };
    return h.response(response).code(200);
  },

  async getSendings(_request, h) {
    const sendings = await usecases.getPoleEmploiSendings();
    return h.response(sendings).code(200);
  },
};
