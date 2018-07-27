const JSONAPIError = require('jsonapi-serializer').Error;

const errorSerializer = require('../../infrastructure/serializers/jsonapi/error-serializer');
const logger = require('../../infrastructure/logger');
const smartPlacementAssessmentRepository =
  require('../../infrastructure/repositories/smart-placement-assessment-repository');
const skillReviewSerializer = require('../../infrastructure/serializers/jsonapi/skill-review-serializer');
const usecases = require('../../domain/usecases');
const { InfrastructureError } = require('../../infrastructure/errors');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

function _buildJsonApiInternalServerError(error) {
  const internalError = new InfrastructureError(error.message);
  return errorSerializer.serialize(internalError);
}

module.exports = {

  get(request, reply) {
    const userId = request.auth.credentials.userId;

    const skillReviewId = request.params.id;

    return usecases.getSkillReview({
      skillReviewId,
      userId,
      smartPlacementAssessmentRepository,
    })
      .then(skillReviewSerializer.serialize)
      .then((serializedSkillReview) => reply(serializedSkillReview).code(200))
      .catch((error) => {

        if (error instanceof UserNotAuthorizedToAccessEntity) {
          const jsonAPIError = new JSONAPIError({
            code: '403',
            title: 'Unauthorized Access',
            detail: 'Vous n’avez pas accès à ce profil d’avancement',
          });
          return reply(jsonAPIError).code(403);
        }

        if (error instanceof NotFoundError) {
          const jsonApiError = new JSONAPIError({
            title: 'Not Found',
            code: '404',
            detail: `Profil d’avancement introuvable pour l’id ${skillReviewId}`,
          });
          return reply(jsonApiError).code(404);
        }

        logger.error(error);
        reply(_buildJsonApiInternalServerError(error)).code(500);
      });
  },
};
