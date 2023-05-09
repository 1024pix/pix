import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as validationErrorSerializer from '../../infrastructure/serializers/jsonapi/validation-error-serializer.js';
import { extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const verify = function (request, h) {
  const userId = extractUserIdFromRequest(request);
  // eslint-disable-next-line no-restricted-syntax
  const assessmentId = parseInt(request.params.id);

  return assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId).catch(() => {
    const buildError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette évaluation');
    return h.response(validationErrorSerializer.serialize(buildError)).code(401).takeover();
  });
};

export { verify };

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}
