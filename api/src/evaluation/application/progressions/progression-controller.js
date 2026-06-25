import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import { progressionSerializer } from '../../infrastructure/serializers/jsonapi/progression-serializer.js';

const get = function (request) {
  const userId = request.auth.credentials.userId;

  const progressionId = request.params.id;

  return usecases
    .getProgression({
      progressionId,
      userId,
    })
    .then(progressionSerializer.serialize);
};

const progressionController = { get };

export { progressionController };
