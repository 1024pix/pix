const smartPlacementProgressionSerializer = require('../../infrastructure/serializers/jsonapi/smart-placement-progression-serializer');
const usecases = require('../../domain/usecases');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  get(request, h) {
    const userId = request.auth.credentials.userId;

    const smartPlacementProgressionId = request.params.id;

    return usecases.getSmartPlacementProgression({
      smartPlacementProgressionId,
      userId,
    })
      .then(smartPlacementProgressionSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },
};
