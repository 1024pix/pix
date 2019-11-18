const {
  ForbiddenAccess
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
  return sessionRepository.updateStatus({ sessionId, status: statuses.COMPLETED })
    .then(() => sessionRepository.get(sessionId));
};
