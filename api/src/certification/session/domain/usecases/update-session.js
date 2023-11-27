/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */

/**
 * @param {Object} params
 * @param {deps['sessionRepository']} params.sessionRepository
 * @param {deps['sessionValidator']} params.sessionValidator
 */
const updateSession = async function ({ session, sessionRepository, sessionValidator }) {
  sessionValidator.validate(session);
  const sessionToUpdate = await sessionRepository.get(session.id);
  Object.assign(sessionToUpdate, session);

  return sessionRepository.updateSessionInfo(sessionToUpdate);
};

export { updateSession };
