import { BadRequestError } from '../http-errors.js';
import { _ } from '../../infrastructure/utils/lodash-utils.js';
import * as serializer from '../../infrastructure/serializers/jsonapi/feedback-serializer.js';

const save = async function (request, h) {
  const newUserAgent = request.headers['user-agent'].slice(0, 255);
  const feedback = await serializer.deserialize(request.payload, newUserAgent);

  if (_.isBlank(feedback.get('content'))) {
    throw new BadRequestError('Feedback content must not be blank');
  }

  const persistedFeedback = await feedback.save();

  return h.response(serializer.serialize(persistedFeedback.toJSON())).created();
};

export { save };
