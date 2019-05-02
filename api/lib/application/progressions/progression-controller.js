const ProgressionSerializer = require('../../infrastructure/serializers/jsonapi/progression-serializer');
const usecases = require('../../domain/usecases');

module.exports = {

  get(request) {
    const userId = request.auth.credentials.userId;

    const progressionId = request.params.id;

    return usecases.getProgression({
      progressionId,
      userId,
    }).then(ProgressionSerializer.serialize);
  },
};
