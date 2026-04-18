import * as challengeToPlayApi from '../../evaluation/application/api/challenge-to-play-api.js';
import * as challengeSerializer from '../infrastructure/serializers/challenge-serializer.js';

const get = async function (request, h, dependencies = { challengeToPlayApi, challengeSerializer }) {
  const challengeToPlay = await dependencies.challengeToPlayApi.get(request.params.id);
  return dependencies.challengeSerializer.serialize(challengeToPlay);
};

const challengeController = { get };

export { challengeController };
