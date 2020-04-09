const { NotFoundError } = require('../../domain/errors');

module.exports = async function assignUserToSession({
  sessionId,
  userId,
  sessionRepository,
} = {}) {
  const ERROR_MESSAGE = `La session ${sessionId} n'existe pas.`;
  const integerSessionId = parseInt(sessionId);
  if (!Number.isFinite(integerSessionId)) {
    throw new NotFoundError(ERROR_MESSAGE);
  }

  const { id } = await sessionRepository.get(sessionId);
  return sessionRepository.assignUser({ id, assignedUserId: userId });
};
