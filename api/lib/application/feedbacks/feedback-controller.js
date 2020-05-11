const { BadRequestError } = require('../http-errors');
const _ = require('../../infrastructure/utils/lodash-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/feedback-serializer');

module.exports = {

  async save(request, h) {
    const newFeedback = await serializer.deserialize(request.payload);

    if (_.isBlank(newFeedback.get('content'))) {
      throw new BadRequestError('Feedback content must not be blank');
    }

    const persistedFeedback = await newFeedback.save();

    return h.response(serializer.serialize(persistedFeedback.toJSON())).created();
  },

};
