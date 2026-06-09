import { UserNotFoundError } from '../../../shared/domain/errors.js';
import * as errorSerializer from '../../../shared/infrastructure/serializers/jsonapi/validation-error-serializer.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';

const verifyById = function (request, h, dependencies = { userRepository }) {
  return dependencies.userRepository.get(request.params.id).catch((err) => {
    if (err instanceof UserNotFoundError) {
      const serializedError = errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
      return h.response(serializedError).code(404).takeover();
    }
  });
};

export const userVerification = { verifyById };
