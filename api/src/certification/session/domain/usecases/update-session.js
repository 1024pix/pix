/**
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionValidator} SessionValidator
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionValidator} params.sessionValidator
 */
const updateSession = async function ({ session, sessionRepository, sessionValidator }) {
  sessionValidator.validate(session);
  const sessionToUpdate = await sessionRepository.get(session.id);
  Object.assign(sessionToUpdate, session);

  return sessionRepository.updateSessionInfo(sessionToUpdate);
};

export { updateSession };
