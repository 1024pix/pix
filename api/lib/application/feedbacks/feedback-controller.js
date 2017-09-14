const Boom = require('boom');
const _ = require('../../infrastructure/utils/lodash-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/feedback-serializer');
const repository = require('../../infrastructure/repositories/feedback-repository');
const logger = require('../../infrastructure/logger');

module.exports = {

  save : async(request, reply) => {

    const newFeedback = await serializer.deserialize(request.payload);

    if (_.isBlank(newFeedback.get('content'))) {
      return reply(Boom.badRequest('Feedback content must not be blank'));
    }

    return newFeedback
      .save()
      .then(persistedFeedback => {
        reply(serializer.serialize(persistedFeedback.toJSON())).code(201);
      })
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  find(request, reply) {
    const { start_date: startDate, end_date: endDate } = request.query;

    return repository
      .find({ startDate, endDate })
      .then(feedbacks => serializer.serialize(feedbacks.toJSON()))
      .then(reply);
  }

};
