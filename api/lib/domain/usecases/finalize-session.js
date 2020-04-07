const { SessionAlreadyFinalizedError } = require('../errors');

module.exports = async function finalizeSession({
  sessionId,
  examinerGlobalComment,
  certificationReports,
  sessionRepository,
  certificationReportRepository,
}) {

  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);

  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError('Cannot finalize session more than once');
  }

  certificationReports.forEach((certifReport) => certifReport.validateForFinalization());

  await certificationReportRepository.finalizeAll(certificationReports);

  return sessionRepository.finalize({
    id: sessionId,
    examinerGlobalComment,
    finalizedAt: new Date(),
  });
};
