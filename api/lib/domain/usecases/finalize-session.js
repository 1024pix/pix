const { SessionAlreadyFinalizedError } = require('../errors');
const { statuses } = require('../../domain/models/Session');

module.exports = async function finalizeSession({
  sessionId,
  examinerComment,
  certificationCandidates,
  sessionRepository,
  certificationCandidateRepository,
}) {
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);

  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError('Cannot finalize session more than once');
  }

  await certificationCandidateRepository.finalizeAll(certificationCandidates);

  return sessionRepository.updateStatusAndExaminerComment({
    id: sessionId,
    status: statuses.FINALIZED,
    examinerComment,
  });
};
