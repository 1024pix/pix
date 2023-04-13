const challengeRepository = require('../../infrastructure/repositories/challenge-repository.js');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer.js');

module.exports = {
  async get(request, h, dependencies = { challengeRepository, challengeSerializer }) {
    const challenge = await dependencies.challengeRepository.get(request.params.id);
    return dependencies.challengeSerializer.serialize(challenge);
  },
};
