import * as ProgressionSerializer from '../../infrastructure/serializers/jsonapi/progression-serializer.js';
import { evaluationUsecases as usecases } from '../../../src/evaluation/domain/usecases/index.js';

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

const progressionController = { get };

export { progressionController };
