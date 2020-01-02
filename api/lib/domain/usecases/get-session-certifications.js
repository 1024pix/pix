const _ = require('lodash');
const certificationService = require('../../domain/services/certification-service');

module.exports = async function getSessionCertifications({
  sessionId,
  certificationCourseRepository,
}) {
  const certificationCourseIds = await certificationCourseRepository.findIdsBySessionId(sessionId);
  const certificationCourseIdsChunks = _.chunk(certificationCourseIds, 10);
  const certificationResultsChunks = await Promise.all(_.map(certificationCourseIdsChunks, (certificationCourseIdsChunk) => {
    return Promise.all(_.map(certificationCourseIdsChunk, certificationService.getCertificationResult));
  }));
  return _.flatten(certificationResultsChunks);
};
