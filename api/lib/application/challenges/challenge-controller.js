const challengeRepository = require('../../infrastructure/repositories/challenge-repository.js');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer.js');

module.exports = {
  get(request) {
    return challengeRepository.get(request.params.id).then((challenge) => challengeSerializer.serialize(challenge));
  },
};
