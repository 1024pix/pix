import prescriberSerializer from '../../infrastructure/serializers/jsonapi/prescriber-serializer';
import usecases from '../../domain/usecases';

export default {
  get(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases
      .getPrescriber({ userId: authenticatedUserId })
      .then((prescriber) => prescriberSerializer.serialize(prescriber));
  },
};
