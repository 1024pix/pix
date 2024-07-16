import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as validationErrorSerializer from '../../../shared/infrastructure/serializers/jsonapi/validation-error-serializer.js';
import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';

const verify = function (
  request,
  h,
  dependencies = { requestResponseUtils, assessmentRepository, validationErrorSerializer },
) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  // eslint-disable-next-line no-restricted-syntax
  const assessmentId = parseInt(request.params.id);

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
