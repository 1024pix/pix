import * as challengeSerializer from '../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer.js';
import { usecases } from '../../shared/usecases/index.js';
const getNextChallengeForPix1d = async function (request, h, dependencies = { challengeSerializer }) {
  const assessmentId = request.params.id;
  const challenge = await usecases.getNextChallengeForPix1d({ assessmentId });
  return dependencies.challengeSerializer.serialize(challenge);
};

const assessmentController = {
  getNextChallengeForPix1d,
};

export { assessmentController };
