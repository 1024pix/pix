const userRepository = require('../../../lib/infrastructure/repositories/user-repository.js');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer.js');
const { UserNotFoundError } = require('../../domain/errors.js');

module.exports = {
  verifyById(request, h, dependencies = { userRepository, errorSerializer }) {
    return dependencies.userRepository.get(request.params.id).catch((err) => {
      if (err instanceof UserNotFoundError) {
        const serializedError = dependencies.errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
        return h.response(serializedError).code(404).takeover();
      }
    });
  },
};
