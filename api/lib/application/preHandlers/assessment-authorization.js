import assessmentRepository from '../../infrastructure/repositories/assessment-repository';
import validationErrorSerializer from '../../infrastructure/serializers/jsonapi/validation-error-serializer';
import { extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils';

export default {
  verify(request, h) {
    const userId = extractUserIdFromRequest(request);
    // eslint-disable-next-line no-restricted-syntax
    const assessmentId = parseInt(request.params.id);

    return assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId).catch(() => {
      const buildError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette évaluation');
      return h.response(validationErrorSerializer.serialize(buildError)).code(401).takeover();
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
