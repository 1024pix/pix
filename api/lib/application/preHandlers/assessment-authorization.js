const assessmentRepository = require('../../infrastructure/repositories/assessment-repository.js');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  verify(request, h, dependencies = { requestResponseUtils, assessmentRepository, validationErrorSerializer }) {
    const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
    // eslint-disable-next-line no-restricted-syntax
    const assessmentId = parseInt(request.params.id);

    return dependencies.assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId).catch(() => {
      const buildError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette évaluation');
      return h.response(dependencies.validationErrorSerializer.serialize(buildError)).code(401).takeover();
    });
  },
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}
