import { usecases } from '../../school/domain/usecases/index.js';
import * as activityAnswerSerializer from '../infrastructure/serializers/activity-answer-serializer.js';

const save = async function (request, h, dependencies = { activityAnswerSerializer }) {
  const { activityAnswer, assessmentId, isPreview } = dependencies.activityAnswerSerializer.deserialize(
    request.payload,
  );

  // corrected answer is not saved for preview
  if (isPreview) {
    const correctedAnswer = await usecases.correctPreviewAnswer({ activityAnswer });
    return h.response(dependencies.activityAnswerSerializer.serialize(correctedAnswer));
  }
  const correctedAnswer = await usecases.handleActivityAnswer({ activityAnswer, assessmentId });
  return h.response(dependencies.activityAnswerSerializer.serialize(correctedAnswer)).created();
};

const activityAnswerController = { save };

export { activityAnswerController };
