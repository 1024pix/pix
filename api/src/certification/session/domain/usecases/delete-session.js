import { SessionStartedDeletionError } from '../../../../../lib/domain/errors.js';

/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */

/**
 * @param {Object} params
 * @param {deps['sessionRepository']} params.sessionRepository
 * @param {deps['certificationCourseRepository']} params.certificationCourseRepository
 */
const deleteSession = async function ({ sessionId, sessionRepository, certificationCourseRepository }) {
  if (await _isSessionStarted(certificationCourseRepository, sessionId)) {
    throw new SessionStartedDeletionError();
  }

  await sessionRepository.remove(sessionId);
};

export { deleteSession };

async function _isSessionStarted(certificationCourseRepository, sessionId) {
  const foundCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  return foundCertificationCourses.length > 0;
}
