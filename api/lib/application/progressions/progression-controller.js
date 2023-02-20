import ProgressionSerializer from '../../infrastructure/serializers/jsonapi/progression-serializer';
import usecases from '../../domain/usecases';

export default {
  get(request) {
    const userId = request.auth.credentials.userId;

    const progressionId = request.params.id;

    return usecases
      .getProgression({
        progressionId,
        userId,
      })
      .then(ProgressionSerializer.serialize);
  },
};
