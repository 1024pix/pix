import * as challengeSerializer from '../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer.js';
import { usecases } from '../../shared/usecases/index.js';
import * as assessmentSerializer from '../../../../src/school/infrastructure/serializers/assessment.js';

const getNextChallengeForPix1d = async function (request, h, dependencies = { challengeSerializer }) {
  const assessmentId = request.params.id;
  const challenge = await usecases.getNextChallenge({ assessmentId });
  return dependencies.challengeSerializer.serialize(challenge);
};

const createForPix1d = async function (request, h, dependencies = { assessmentSerializer }) {
  const { missionId, learnerId } = request.payload;
  const createdAssessment = await usecases.createMissionAssessment({ missionId, organizationLearnerId: learnerId });
  return h.response(dependencies.assessmentSerializer.serialize(createdAssessment)).created();
};

const assessmentController = {
  getNextChallengeForPix1d,
  createForPix1d,
};

export { assessmentController };
