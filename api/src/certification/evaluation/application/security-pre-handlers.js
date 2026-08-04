import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import { validationErrorSerializer } from '../../../shared/infrastructure/serializers/jsonapi/validation-error-serializer.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as checkUserOwnsCertificationCourseUseCase from './usecases/checkUserOwnsCertificationCourse.js';

async function checkUserOwnsCertificationCourse(
  request,
  h,
  dependencies = { checkUserOwnsCertificationCourseUseCase },
) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;

  try {
    const ownsCertificationCourse = await dependencies.checkUserOwnsCertificationCourseUseCase.execute({
      userId,
      certificationCourseId,
    });
    return ownsCertificationCourse ? h.response(true) : securityPreHandlers.replyForbiddenError(h);
  } catch {
    return securityPreHandlers.replyForbiddenError(h);
  }
}

async function checkUserOwnsAssessment(request, h, dependencies = { assessmentRepository, validationErrorSerializer }) {
  const userId = extractUserIdFromRequest(request);

  const assessmentId = parseInt(request.params.id) || parseInt(request.params.assessmentId);

  return dependencies.assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId).catch(() => {
    const buildError = _handleWhenInvalidAuthorization('Vous n’êtes pas autorisé à accéder à cette évaluation');
    return h.response(dependencies.validationErrorSerializer.serialize(buildError)).code(401).takeover();
  });
}

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}

export const evaluationSecurityPreHandlers = {
  checkUserOwnsCertificationCourse,
  checkUserOwnsAssessment,
};
