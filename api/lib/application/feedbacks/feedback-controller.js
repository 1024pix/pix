import { BadRequestError } from '../http-errors';
import _ from '../../infrastructure/utils/lodash-utils';
import serializer from '../../infrastructure/serializers/jsonapi/feedback-serializer';

export default {
  async save(request, h) {
    const newUserAgent = request.headers['user-agent'].slice(0, 255);
    const feedback = await serializer.deserialize(request.payload, newUserAgent);

    if (_.isBlank(feedback.get('content'))) {
      throw new BadRequestError('Feedback content must not be blank');
    }

    const persistedFeedback = await feedback.save();

    return h.response(serializer.serialize(persistedFeedback.toJSON())).created();
  },
};
