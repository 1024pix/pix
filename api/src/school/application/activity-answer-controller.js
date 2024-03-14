import { usecases } from '../../school/domain/usecases/index.js';
import * as activityAnswerSerializer from '../infrastructure/serializers/activity-answer-serializer.js';

const save = async function (request, h, dependencies = { activityAnswerSerializer }) {
  const { activityAnswer, assessmentId, isPreview } = dependencies.activityAnswerSerializer.deserialize(
    request.payload,
  );
  const createdAnswer = await usecases.correctAnswer({ activityAnswer, assessmentId, isPreview });

  return h.response(dependencies.activityAnswerSerializer.serialize(createdAnswer)).created();
};

const activityAnswerController = { save };

export { activityAnswerController };
