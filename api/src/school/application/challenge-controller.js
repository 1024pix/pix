import * as challengeRepository from '../../shared/infrastructure/repositories/challenge-repository.js';
import * as challengeSerializer from '../../shared/infrastructure/serializers/jsonapi/challenge-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const get = async function (request, h, dependencies = { challengeRepository, challengeSerializer }) {
  const challenge = await usecases.getChallenge({ id: request.params.id });
  return dependencies.challengeSerializer.serialize(challenge);
};

const challengeController = { get };

export { challengeController };
