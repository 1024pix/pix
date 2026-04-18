import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';

const get = async function (request, h, dependencies = { challengeToPlayRepository, challengeSerializer }) {
  const challengeToPlay = await dependencies.challengeToPlayRepository.get(request.params.id);
  return dependencies.challengeSerializer.serialize(challengeToPlay);
};

const challengeController = { get };

export { challengeController };
