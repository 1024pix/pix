const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const User = require('../../infrastructure/data/user');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const { UserNotFoundError } = require('../../domain/errors');

module.exports = {
  verifyById(request, reply) {
    return userRepository
      .findUserById(request.params.id)
      .then(reply)
      .catch((err) => {
        if (err instanceof User.NotFoundError) {
          const serializedError = errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
          return reply(serializedError).code(404).takeover();
        }
      });
  }
};
