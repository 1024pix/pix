const sessionValidator = require('../validators/session-validator');

module.exports = async function updateSession({ session, sessionRepository }) {
  sessionValidator.validate(session);
  const sessionToUpdate = await sessionRepository.get(session.id);
  Object.assign(sessionToUpdate, session);

  return sessionRepository.updateSessionInfo(sessionToUpdate);
};
