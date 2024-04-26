import { SessionStartedDeletionError } from '../../../session/domain/errors.js';

/**
 * @typedef {import("./index.js").CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import("./index.js").SessionRepository} SessionRepository
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 */
const deleteSession = async function ({ sessionId, sessionRepository, certificationCourseRepository }) {
  if (await _isSessionStarted(certificationCourseRepository, sessionId)) {
    throw new SessionStartedDeletionError();
  }

  await sessionRepository.remove({ id: sessionId });
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
