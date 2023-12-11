import { SessionStartedDeletionError } from '../errors.js';

/**
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 */
const deleteSession = async function ({ sessionId, sessionRepository, certificationCourseRepository }) {
  if (await _isSessionStarted(certificationCourseRepository, sessionId)) {
    certificationCourseRepository.findCertificationCoursesBySessionId;
    throw new SessionStartedDeletionError();
  }

  await sessionRepository.remove(sessionId);
};

export { deleteSession };

/**
 * @param {CertificationCourseRepository} certificationCourseRepository
 * @param {Number} sessionId
 */
async function _isSessionStarted(certificationCourseRepository, sessionId) {
  const foundCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  return foundCertificationCourses.length > 0;
}
