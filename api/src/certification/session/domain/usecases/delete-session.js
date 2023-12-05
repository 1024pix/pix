/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */
import { SessionStartedDeletionError } from '../errors.js';

class DeleteSession {
  /** @type {deps['sessionRepository']} */
  #sessionRepository;

  /** @type {deps['certificationCourseRepository']} */
  #certificationCourseRepository;

  /**
   * @param {Object} params
   * @param {deps['sessionRepository']} params.sessionRepository
   * @param {deps['certificationCourseRepository']} params.certificationCourseRepository
   */
  constructor({ sessionRepository, certificationCourseRepository }) {
    this.#sessionRepository = sessionRepository;
    this.#certificationCourseRepository = certificationCourseRepository;
  }

  /**
   * @param {Object} params
   * @param {integer} params.sessionId - session identifier
   */
  async execute({ sessionId }) {
    if (await this.#isSessionStarted(sessionId)) {
      throw new SessionStartedDeletionError();
    }

    await this.#sessionRepository.remove(sessionId);
  }

  async #isSessionStarted(sessionId) {
    const foundCertificationCourses = await this.#certificationCourseRepository.findCertificationCoursesBySessionId({
      sessionId,
    });
    return foundCertificationCourses.length > 0;
  }
}

const deleteSession = async ({ sessionId, sessionRepository, certificationCourseRepository }) => {
  return new DeleteSession({ sessionRepository, certificationCourseRepository }).execute({ sessionId });
};
export { deleteSession };
