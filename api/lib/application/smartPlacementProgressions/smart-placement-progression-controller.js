const smartPlacementProgressionSerializer = require('../../infrastructure/serializers/jsonapi/smart-placement-progression-serializer');
const usecases = require('../../domain/usecases');

module.exports = {

  get(request) {
    const userId = request.auth.credentials.userId;

    const smartPlacementProgressionId = request.params.id;

    return usecases.getSmartPlacementProgression({
      smartPlacementProgressionId,
      userId,
    })
      .then(smartPlacementProgressionSerializer.serialize);
  },
};
