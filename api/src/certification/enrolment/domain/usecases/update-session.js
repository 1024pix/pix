/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 *
 * @typedef {import('./index.js').SessionValidator} SessionValidator
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionValidator} params.sessionValidator
 */
const updateSession = async function ({ session, sessionRepository, sessionValidator }) {
  sessionValidator.validate(session);
  const sessionToUpdate = await sessionRepository.get({ id: session.id });
  sessionToUpdate.updateInfo(session);
  await sessionRepository.update(sessionToUpdate);
  return sessionRepository.get({ id: sessionToUpdate.id });
};

export { updateSession };
