const Boom = require('boom');

const assessmentRatingSerializer = require('../../infrastructure/serializers/jsonapi/assessment-rating-serializer');
const assessmentRatingService = require('../../domain/services/assessment-rating-service');

const { NotFoundError, AlreadyRatedAssessmentError } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');

module.exports = {

  evaluate(request, reply) {
    const assessmentRating = assessmentRatingSerializer.deserialize(request.payload);

    return assessmentRatingService.evaluateFromAssessmentId(assessmentRating.assessmentId)
      .then(() => {
        reply();
      })
      .catch((error) => {
        if(error instanceof NotFoundError) {
          return reply(Boom.notFound(error));
        } else if (error instanceof AlreadyRatedAssessmentError) {
          return reply();
        }

        logger.error(error);

        reply(Boom.badImplementation(error));
      });
  }

};
