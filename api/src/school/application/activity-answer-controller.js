import * as activityAnswerSerializer from '../infrastructure/serializers/activity-answer-serializer.js';
import { sharedUsecases } from '../../shared/domain/usecases/index.js';

const save = async function (request, h, dependencies = { activityAnswerSerializer }) {
  const { activityAnswer, assessmentId } = dependencies.activityAnswerSerializer.deserialize(request.payload);
  const createdAnswer = await sharedUsecases.correctAnswer({ activityAnswer, assessmentId });

  return h.response(dependencies.activityAnswerSerializer.serialize(createdAnswer)).created();
};

const activityAnswerController = { save };

export { activityAnswerController };
