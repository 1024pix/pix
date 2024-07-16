import * as userRepository from '../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import * as errorSerializer from '../../../src/shared/infrastructure/serializers/jsonapi/validation-error-serializer.js';
import { UserNotFoundError } from '../../domain/errors.js';

const verifyById = function (request, h, dependencies = { userRepository, errorSerializer }) {
  return dependencies.userRepository.get(request.params.id).catch((err) => {
    if (err instanceof UserNotFoundError) {
      const serializedError = dependencies.errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
      return h.response(serializedError).code(404).takeover();
    }
  });
};

const userVerification = { verifyById };

export { userVerification };
