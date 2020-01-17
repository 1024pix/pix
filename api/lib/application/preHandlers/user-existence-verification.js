const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const { UserNotFoundError } = require('../../domain/errors');

module.exports = {
  verifyById(request, h) {
    return userRepository
      .get(parseInt(request.params.id))
      .catch((err) => {
        if (err instanceof UserNotFoundError) {
          const serializedError = errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
          return h.response(serializedError).code(404).takeover();
        }
      });
  }
};
