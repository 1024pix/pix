import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import { validationErrorSerializer } from '../../../shared/infrastructure/serializers/jsonapi/validation-error-serializer.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';

const verify = function (request, h, dependencies = { assessmentRepository, validationErrorSerializer }) {
  const userId = extractUserIdFromRequest(request);

  const assessmentId = parseInt(request.params.id) || parseInt(request.params.assessmentId);

  return dependencies.assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId).catch(() => {
    const buildError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette évaluation');
    return h.response(dependencies.validationErrorSerializer.serialize(buildError)).code(401).takeover();
  });
};

const assessmentAuthorization = { verify };

export { assessmentAuthorization };

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}
