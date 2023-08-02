import * as serializer from '../../infrastructure/serializers/jsonapi/feedback-serializer.js';

const save = async function (request, h) {
  const newUserAgent = request.headers['user-agent'].slice(0, 255);
  const feedback = await serializer.deserialize(request.payload, newUserAgent);

  const persistedFeedback = await feedback.save();

  return h.response(serializer.serialize(persistedFeedback.toJSON())).created();
};

const feedbackController = { save };
export { feedbackController };
