const User = require('../../../lib/domain/models/data/user');

const jsonwebtoken = require('jsonwebtoken');

const encrypt = require('../../domain/services/encryption-service');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const settings = require('../../settings');

const Authentication = require('../../domain/models/data/authentication');
const authenticationSerializer = require('../../infrastructure/serializers/jsonapi/authentication-serializer');

module.exports = {
  save(request, reply) {

    let user;

    return new User({ email: request.payload.data.attributes.email })
      .fetch()
      .then(foundUser => {

        if (foundUser === null) {
          return Promise.reject();
        }

        user = foundUser;

        const givenPassword = request.payload.data.attributes.password;

        return encrypt.check(givenPassword, foundUser.get('password'));
      })
      .then(_ => {
        const token = jsonwebtoken.sign({
          user_id: user.get('id'),
          email: user.get('email')
        }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

        const authentication = new Authentication(user.get('id'), token);
        return reply(authenticationSerializer.serialize(authentication)).code(201);
      })
      .catch(() => {
        const message = validationErrorSerializer.serialize(_buildError());
        reply(message).code(400);
      });
  }
};

function _buildError() {
  return {
    data: {
      '': [ 'L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.' ]
    }
  };
}
