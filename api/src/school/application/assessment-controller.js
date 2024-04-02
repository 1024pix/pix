import * as assessmentSerializer from '../../../src/school/infrastructure/serializers/assessment.js';
import * as challengeSerializer from '../../shared/infrastructure/serializers/jsonapi/challenge-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as activitySerializer from '../infrastructure/serializers/activity-serializer.js';

const getNextChallengeForPix1d = async function (request, h, dependencies = { challengeSerializer }) {
  const assessmentId = request.params.id;
  const challenge = await usecases.getNextChallenge({ assessmentId });
  return dependencies.challengeSerializer.serialize(challenge);
};

const create = async function (request, h, dependencies = { assessmentSerializer }) {
  const { missionId, learnerId } = request.payload;
  const createdAssessment = await usecases.playMission({
    missionId,
    organizationLearnerId: learnerId,
  });
  return h.response(dependencies.assessmentSerializer.serialize(createdAssessment)).created();
};

const getById = async function (request, h, dependencies = { assessmentSerializer }) {
  const assessmentId = request.params.id;
  const assessment = await usecases.getAssessmentById({ assessmentId });
  return dependencies.assessmentSerializer.serialize(assessment);
};

const getCurrentActivity = async function (request, h, dependencies = { activitySerializer }) {
  const assessmentId = request.params.id;
  const activity = await usecases.getCurrentActivity({ assessmentId });
  return dependencies.activitySerializer.serialize(activity);
};

const assessmentController = {
  getNextChallengeForPix1d,
  create,
  getById,
  getCurrentActivity,
};

export { assessmentController };
