import * as ProgressionSerializer from '../../infrastructure/serializers/jsonapi/progression-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const get = function (request) {
  const userId = request.auth.credentials.userId;

  const progressionId = request.params.id;

  return usecases
    .getProgression({
      progressionId,
      userId,
    })
    .then(ProgressionSerializer.serialize);
};

export { get };
