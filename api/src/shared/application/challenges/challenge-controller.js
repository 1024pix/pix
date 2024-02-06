import { sharedUsecases } from '../../domain/usecases/index.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';

const get = async function (request, _h, dependencies = { sharedUsecases, challengeSerializer }) {
  const challenge = await dependencies.sharedUsecases.getChallenge({ challengeId: request.params.id });
  return dependencies.challengeSerializer.serialize(challenge);
};

const challengeController = { get };

export { challengeController };
