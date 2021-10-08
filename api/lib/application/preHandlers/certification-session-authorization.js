const { NotFoundError } = require('../http-errors');
const sessionAuthorizationService = require('../../domain/services/session-authorization-service');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');

module.exports = {
  async verify(request) {
    const userId = request.auth.credentials.userId;
    const certificationCourseId = request.params.id;

    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);

    const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({
      userId,
      sessionId: certificationCourse.getSessionId(),
    });

    if (!isAuthorized) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }

    return isAuthorized;
  },
};
