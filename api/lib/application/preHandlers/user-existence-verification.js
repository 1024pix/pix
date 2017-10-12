const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const { UserNotFoundError } = require('../../domain/errors');

module.exports = {
  verifyById(request, reply) {
    return userRepository
      .countUserById(request.params.id)
      .then((count) => {
        if (!_isUserExist(count)) {
          const serializedError = errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
          return reply(serializedError).code(404).takeover();
        }

        reply(count);
      });
  }
};

function _isUserExist(count) {
  return count && count === 1;
}
