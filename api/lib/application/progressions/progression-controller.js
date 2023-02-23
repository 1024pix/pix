const ProgressionSerializer = require('../../infrastructure/serializers/jsonapi/progression-serializer');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
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
