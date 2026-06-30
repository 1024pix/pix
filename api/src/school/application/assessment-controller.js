import { usecases } from '../domain/usecases/index.js';
import { activitySerializer } from '../infrastructure/serializers/activity-serializer.js';
import { assessmentSerializer } from '../infrastructure/serializers/assessment-serializer.js';
import { challengeSerializer } from '../infrastructure/serializers/challenge-serializer.js';

const getNextChallengeForPix1d = async function (request, h, dependencies = { challengeSerializer }) {
  const assessmentId = request.params.id;
  const challengeToPlay = await usecases.getNextChallenge({ assessmentId });
  return dependencies.challengeSerializer.serialize(challengeToPlay);
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

const createAssessmentPreviewForPix1d = async function (request, h, dependencies = { assessmentSerializer }) {
  const createdAssessment = await usecases.createPreviewAssessment({});
  return h.response(dependencies.assessmentSerializer.serialize(createdAssessment)).created();
};

const assessmentController = {
  createAssessmentPreviewForPix1d,
  getNextChallengeForPix1d,
  create,
  getById,
  getCurrentActivity,
};

export { assessmentController };
