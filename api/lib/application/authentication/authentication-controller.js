const encrypt = require('../../domain/services/encryption-service');
const tokenService = require('../../domain/services/token-service');
const userRepository = require('../../infrastructure/repositories/user-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const authenticationSerializer = require('../../infrastructure/serializers/jsonapi/authentication-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

const usecases = require('../../domain/usecases');

const Authentication = require('../../domain/models/Authentication');
const JSONAPIError = require('jsonapi-serializer').Error;

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
  save(request, reply) {

    const userFromRequest = userSerializer.deserialize((request.payload));
    let user;

    return userRepository.findByEmail(userFromRequest.email)
      .then(foundUser => {

        if (foundUser === null) {
          return Promise.reject();
        }

        user = foundUser;
        return encrypt.check(userFromRequest.password, foundUser.password);
      })
      .then(_ => {
        const token = tokenService.createTokenFromUser(user);

        const authentication = new Authentication({ userId: user.id, token });
        return reply(authenticationSerializer.serialize(authentication)).code(201);
      })
      .catch(() => {
        const message = validationErrorSerializer.serialize(_buildError());
        reply(message).code(400);
      });
  },

  /**
   * @see https://tools.ietf.org/html/rfc6749#section-4.3
   */
  authenticateUser(request, reply) {
    const { username, password, scope } = request.payload;

    return usecases.authenticateUser({ userEmail: username, password, scope, userRepository, tokenService })
      .then(accessToken => {
        return reply({
          token_type: 'bearer',
          expires_in: 3600,
          access_token: accessToken,
        })
          .code(200)
          .header('Content-Type', 'application/json;charset=UTF-8')
          .header('Cache-Control', 'no-store')
          .header('Pragma', 'no-cache');
      })
      .catch(() => {
        const errorStatusCode = 403;
        const jsonApiError = new JSONAPIError({
          code: errorStatusCode.toString(),
          title: 'Forbidden',
          detail: 'Bad credentials',
        });
        return reply(jsonApiError).code(errorStatusCode);
      });
  },

};
