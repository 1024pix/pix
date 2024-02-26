import * as activityAnswerSerializer from '../infrastructure/serializers/activity-answer-serializer.js';
import { usecases } from '../../school/domain/usecases/index.js';

const save = async function (request, h, dependencies = { activityAnswerSerializer }) {
  const { activityAnswer, assessmentId } = dependencies.activityAnswerSerializer.deserialize(request.payload);
  const createdAnswer = await usecases.correctAnswer({ activityAnswer, assessmentId });

  return h.response(dependencies.activityAnswerSerializer.serialize(createdAnswer)).created();
};

const activityAnswerController = { save };

export { activityAnswerController };
