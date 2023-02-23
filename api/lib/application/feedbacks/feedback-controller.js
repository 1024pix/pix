const { BadRequestError } = require('../http-errors.js');
const _ = require('../../infrastructure/utils/lodash-utils.js');
const serializer = require('../../infrastructure/serializers/jsonapi/feedback-serializer.js');

module.exports = {
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
