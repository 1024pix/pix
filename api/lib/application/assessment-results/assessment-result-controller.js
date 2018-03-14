const Boom = require('boom');

const assessmentResultService = require('../../domain/services/assessment-result-service');

const assessmentResultsSerializer = require('../../infrastructure/serializers/jsonapi/assessment-result-serializer');

const { NotFoundError, AlreadyRatedAssessmentError } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');

module.exports = {

  save(request, reply) {
    const jsonResult = request.payload.data.attributes;
    const { assessmentResult, competenceMarks } = assessmentResultsSerializer.deserializeResultsAdd(jsonResult);
    return assessmentResultService.save(assessmentResult, competenceMarks)
      .then(() => reply())
      .catch((error) => {
        if(error instanceof NotFoundError) {
          return reply(Boom.notFound(error));
        }
        logger.error(error);

        reply(Boom.badImplementation(error));
      });
  },

  evaluate(request, reply) {
    const assessmentRating = assessmentResultsSerializer.deserialize(request.payload);

    return assessmentResultService.evaluateFromAssessmentId(assessmentRating.assessmentId)
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
