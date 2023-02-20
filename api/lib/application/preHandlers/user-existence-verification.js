import userRepository from '../../../lib/infrastructure/repositories/user-repository';
import errorSerializer from '../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer';
import { UserNotFoundError } from '../../domain/errors';

export default {
  verifyById(request, h) {
    return userRepository.get(request.params.id).catch((err) => {
      if (err instanceof UserNotFoundError) {
        const serializedError = errorSerializer.serialize(new UserNotFoundError().getErrorMessage());
        return h.response(serializedError).code(404).takeover();
      }
    });
  },
};
