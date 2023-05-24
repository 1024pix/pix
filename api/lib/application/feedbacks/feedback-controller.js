import * as serializer from '../../infrastructure/serializers/jsonapi/feedback-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const save = async function (request, h, dependencies = { usecases }) {
  const newUserAgent = request.headers['user-agent'].slice(0, 255);
  const feedback = await serializer.deserialize(request.payload, newUserAgent);

  const persistedFeedback = await dependencies.usecases.saveFeedback({ feedback });

  return h.response(serializer.serialize(persistedFeedback)).created();
};

const feedbackController = { save };
export { feedbackController };
