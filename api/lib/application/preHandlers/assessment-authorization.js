const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  verify(request, h) {
    const userId = extractUserIdFromRequest(request);
    const assessmentId = parseInt(request.params.id);

    return assessmentRepository
      .getByAssessmentIdAndUserId(assessmentId, userId)
      .catch(() => {
        const buildedError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette évaluation');
        return h.response(validationErrorSerializer.serialize(buildedError)).code(401).takeover();
      });
  }
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}
