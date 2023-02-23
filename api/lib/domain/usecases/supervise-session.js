const { SessionNotAccessible, InvalidSessionSupervisingLoginError } = require('../errors.js');
module.exports = async function superviseSession({
  sessionId,
  supervisorPassword,
  userId,
  sessionRepository,
  supervisorAccessRepository,
}) {
  const session = await sessionRepository.get(sessionId);
  if (!session.isSupervisable(supervisorPassword)) {
    throw new InvalidSessionSupervisingLoginError();
  }
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }
  await supervisorAccessRepository.create({ sessionId, userId });
};
