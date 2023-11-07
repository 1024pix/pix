import * as challengeRepository from '../../../src/certification/shared/infrastructure/repositories/challenge-repository.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';

const get = async function (request, h, dependencies = { challengeRepository, challengeSerializer }) {
  const challenge = await dependencies.challengeRepository.get(request.params.id);
  return dependencies.challengeSerializer.serialize(challenge);
};

const challengeController = { get };

export { challengeController };
