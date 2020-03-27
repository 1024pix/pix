const { NotFoundError } = require('../../domain/errors');

module.exports = async function assignUserToSession({
  sessionId,
  userId,
  sessionRepository,
} = {}) {
  const integerSessionId = parseInt(sessionId);
  if (!Number.isFinite(integerSessionId)) {
    throw new NotFoundError(`Session not found for ID ${sessionId}`);
  }

  try {
    await sessionRepository.get(sessionId);
  } catch (err) {
    throw new NotFoundError(`La session ${sessionId} n'existe pas.`);
  }

  return sessionRepository.assignUser({ id: sessionId, assignedUserId: userId });
};
