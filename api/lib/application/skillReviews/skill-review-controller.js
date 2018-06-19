const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const logger = require('../../infrastructure/logger');
const skillReviewSerializer = require('../../infrastructure/serializers/jsonapi/skill-review-serializer');
const usecases = require('../../domain/usecases');

const errorSerializer = require('../../infrastructure/serializers/jsonapi/error-serializer');
const { InfrastructureError } = require('../../infrastructure/errors');
const { NotFoundError } = require('../../domain/errors');

function _buildJsonApiInternalServerError(error) {
  const internalError = new InfrastructureError(error.message);
  return errorSerializer.serialize(internalError);
}

module.exports = {

  get(request, reply) {
    const skillReviewId = request.params.id;
    const assessmentId = skillReviewId; // TODO change when several skillReview will come

    return usecases.getSkillReviewFromAssessmentId({ assessmentId, assessmentRepository, answerRepository, challengeRepository })
      .then(skillReviewSerializer.serialize)
      .then(serializedSkillReview => reply(serializedSkillReview).code(200))
      .catch(error => {
        logger.error(error);
        if (error instanceof NotFoundError) return reply().code(404);

        reply(_buildJsonApiInternalServerError(error)).code(500);
      });
  }

};
