const {
  ForbiddenAccess,
  SessionAlreadyFinalizedError,
} = require('../errors');

const {
  statuses
} = require('../../domain/models/Session');

module.exports = async function finalizeSession({
  userId,
  sessionId,
  sessionRepository,
} = {}) {
  try {
    await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
  } catch (err) {
    throw new ForbiddenAccess('User does not have the rights to finalize this session');
  }
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);
  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError('Cannot finalize session more than once');
  }
  await sessionRepository.updateStatus({ sessionId, status: statuses.FINALIZED });
  return sessionRepository.get(sessionId);
};
