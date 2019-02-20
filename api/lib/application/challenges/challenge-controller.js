const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  get(request, h) {
    return challengeRepository
      .get(request.params.id)
      .then((challenge) => challengeSerializer.serialize(challenge))
      .catch((error) => errorManager.send(h, error));
  },

};
