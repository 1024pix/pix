import { usecases } from '../../domain/usecases/index.js';
import * as activityAnswerSerializer from '../../infrastructure/serializers/jsonapi/activity-answer-serializer.js';

const save = async function (request, h, dependencies = { activityAnswerSerializer }) {
  const { activityAnswer, assessmentId } = dependencies.activityAnswerSerializer.deserialize(request.payload);
  const createdAnswer = await usecases.correctAnswer({ activityAnswer, assessmentId });

  return h.response(dependencies.activityAnswerSerializer.serialize(createdAnswer)).created();
};

const activityAnswerController = { save };

export { activityAnswerController };
