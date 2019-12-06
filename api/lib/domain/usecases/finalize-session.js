const { SessionAlreadyFinalizedError } = require('../errors');

const {
  statuses
} = require('../../domain/models/Session');

module.exports = async function finalizeSession({
  sessionId,
  examinerComment,
  sessionRepository,
} = {}) {
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);
  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError('Cannot finalize session more than once');
  }

  return sessionRepository.updateStatusAndExaminerComment({
    id: sessionId,
    status: statuses.FINALIZED,
    examinerComment,
  });
};
