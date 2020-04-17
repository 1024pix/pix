const tokenService = require('../../domain/services/token-service');
const usecases = require('../../domain/usecases');

module.exports = {

  /**
   * @see https://tools.ietf.org/html/rfc6749#section-4.3
   */
  async authenticateUser(request, h) {
    const { username, password, scope } = request.payload;

    const accessToken = await usecases.authenticateUser({ username, password, scope });

    return h.response({
      token_type: 'bearer',
      access_token: accessToken,
      user_id: tokenService.extractUserId(accessToken),
    })
      .code(200)
      .header('Content-Type', 'application/json;charset=UTF-8')
      .header('Cache-Control', 'no-store')
      .header('Pragma', 'no-cache');
  }

};
