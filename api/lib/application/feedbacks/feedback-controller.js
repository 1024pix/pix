const _ = require('../../infrastructure/utils/lodash-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/feedback-serializer');
const repository = require('../../infrastructure/repositories/feedback-repository');
const errorManager = require('../../infrastructure/utils/error-manager');
const { BadRequestError } = require('../../infrastructure/errors');

module.exports = {

  save : async(request, h) => {

    const newFeedback = await serializer.deserialize(request.payload);

    if (_.isBlank(newFeedback.get('content'))) {
      return errorManager.send(h, new BadRequestError('Feedback content must not be blank'));
    }

    return newFeedback
      .save()
      .then((persistedFeedback) => {
        return h.response(serializer.serialize(persistedFeedback.toJSON())).created();
      })
      .catch((error) => errorManager.send(h, error));
  },

  find(request) {
    const { start_date: startDate, end_date: endDate } = request.query;

    return repository
      .find({ startDate, endDate })
      .then((feedbacks) => serializer.serialize(feedbacks.toJSON()));
  }

};
