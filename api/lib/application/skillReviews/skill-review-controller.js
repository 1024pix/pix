const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const logger = require('../../infrastructure/logger');
const skillReviewSerializer = require('../../infrastructure/serializers/jsonapi/skill-review-serializer');
const tokenService = require('../../domain/services/token-service');
const usecases = require('../../domain/usecases');

const errorSerializer = require('../../infrastructure/serializers/jsonapi/error-serializer');
const { InfrastructureError } = require('../../infrastructure/errors');
const { NotFoundError, ForbiddenAccess } = require('../../domain/errors');

function _buildJsonApiInternalServerError(error) {
  const internalError = new InfrastructureError(error.message);
  return errorSerializer.serialize(internalError);
}

module.exports = {

  get(request, reply) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);

    const skillReviewId = request.params.id;

    return usecases.getSkillReview({ skillReviewId, userId, assessmentRepository, answerRepository, challengeRepository })
      .then(skillReviewSerializer.serialize)
      .then(serializedSkillReview => reply(serializedSkillReview).code(200))
      .catch(error => {
        if (error instanceof ForbiddenAccess) return reply().code(403);
        if (error instanceof NotFoundError) return reply().code(404);

        logger.error(error);
        reply(_buildJsonApiInternalServerError(error)).code(500);
      });
  }

};
