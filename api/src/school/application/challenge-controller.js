import * as challengeToPlayApi from '../../evaluation/application/api/challenge-to-play-api.js';
import { challengeSerializer } from '../infrastructure/serializers/challenge-serializer.js';

async function get(request, h, dependencies = { challengeToPlayApi, challengeSerializer }) {
  const challengeToPlay = await challengeToPlayApi.get(request.params.id);
  return dependencies.challengeSerializer.serialize(challengeToPlay);
}

const challengeController = { get };

export { challengeController };
