import { usecases } from '../../domain/usecases/index.js';
import * as prescriberSerializer from '../../infrastructure/serializers/jsonapi/prescriber-serializer.js';

const get = function (request, h, dependencies = { prescriberSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  return usecases
    .getPrescriber({ userId: authenticatedUserId })
    .then((prescriber) => dependencies.prescriberSerializer.serialize(prescriber));
};

const prescriberController = { get };

export { prescriberController };
