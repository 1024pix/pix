/* eslint-disable no-restricted-syntax */

const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async verify(request, h) {
    const userId = extractUserIdFromRequest(request);
    const assessmentId = parseInt(request.params.id);
    const assessment = await assessmentRepository.get(assessmentId);
    const certificationCourse = await certificationCourseRepository.get(assessment.certificationCourseId);
    const isSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSession({
      sessionId: certificationCourse.getSessionId(),
      userId,
    });

    if (!isSupervisorForSession) {
      const buildError = _handleWhenInvalidAuthorization(
        'Vous n’êtes pas autorisé à terminer ce test de certification.'
      );
      return h.response(validationErrorSerializer.serialize(buildError)).code(401).takeover();
    }

    return true;
  },
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}
