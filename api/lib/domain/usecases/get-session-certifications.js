const bluebird = require('bluebird');
const certificationService = require('../../domain/services/certification-service');

module.exports = async function getSessionCertifications({
  sessionId,
  certificationCourseRepository,
}) {
  const certificationCourseIds = await certificationCourseRepository.findIdsBySessionId(sessionId);
  return bluebird.mapSeries(certificationCourseIds, certificationService.getCertificationResult);
};
