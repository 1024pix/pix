const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

module.exports = {
  get(request) {
    return challengeRepository.get(request.params.id).then((challenge) => challengeSerializer.serialize(challenge));
  },
};
