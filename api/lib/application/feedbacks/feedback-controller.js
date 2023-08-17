import { usecases } from '../../domain/usecases/index.js';
import * as feedBackSerializer from '../../infrastructure/serializers/jsonapi/feedback-serializer.js';

const save = async function (request, h, dependencies = { feedBackSerializer, usecases }) {
  const newUserAgent = request.headers['user-agent'].slice(0, 255);
  const feedback = await dependencies.feedBackSerializer.deserialize(request.payload, newUserAgent);

  const persistedFeedback = await dependencies.usecases.saveFeedback({ feedback });

  return h.response(dependencies.feedBackSerializer.serialize(persistedFeedback)).created();
};

const feedbackController = { save };
export { feedbackController };
