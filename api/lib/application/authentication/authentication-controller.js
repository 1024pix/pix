const encrypt = require('../../domain/services/encryption-service');
const tokenService = require('../../domain/services/token-service');
const userRepository = require('../../infrastructure/repositories/user-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const authenticationSerializer = require('../../infrastructure/serializers/jsonapi/authentication-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

const usecases = require('../../domain/usecases');

const Authentication = require('../../domain/models/Authentication');

function _buildError() {
  return {
    data: {
      '': ['L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.'],
    },
  };
}

module.exports = {

  // TODO to remove, now we use Oauth2 with endpoint token
  /**
   * @deprecated We use OAuth2 => the endpoint to use is /token and not /authentication
   */
  save(request, h) {

    const userFromRequest = userSerializer.deserialize((request.payload));
    let user;

    return userRepository.findByEmail(userFromRequest.email)
      .then((foundUser) => {

        if (foundUser === null) {
          return Promise.reject();
        }

        user = foundUser;
        return encrypt.check(userFromRequest.password, foundUser.password);
      })
      .then((_) => {
        const token = tokenService.createTokenFromUser(user, 'pix');

        const authentication = new Authentication({ userId: user.id, token });
        return h.response(authenticationSerializer.serialize(authentication)).created();
      })
      .catch(() => {
        const message = validationErrorSerializer.serialize(_buildError());
        return h.response(message).code(400);
      });
  },

  /**
   * @see https://tools.ietf.org/html/rfc6749#section-4.3
   */
  authenticateUser(request, h) {
    const { username, password, scope } = request.payload;

    return usecases.authenticateUser({ userEmail: username, password, scope })
      .then((accessToken) => {
        return h.response({
          token_type: 'bearer',
          expires_in: 3600,
          access_token: accessToken,
          user_id: tokenService.extractUserId(accessToken),
        })
          .code(200)
          .header('Content-Type', 'application/json;charset=UTF-8')
          .header('Cache-Control', 'no-store')
          .header('Pragma', 'no-cache');
      });
  },

};
