const { SessionAlreadyFinalizedError, SessionWithoutStartedCertificationError } = require('../errors');
const SessionFinalized = require('../events/SessionFinalized');

module.exports = async function finalizeSession({
  sessionId,
  examinerGlobalComment,
  certificationReports,
  sessionRepository,
  certificationReportRepository,
  hasIncident,
  hasJoiningIssue,
}) {
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);

  const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification(sessionId);

  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError('Cannot finalize session more than once');
  }

  if (hasNoStartedCertification) {
    throw new SessionWithoutStartedCertificationError();
  }

  certificationReports.forEach((certifReport) => certifReport.validateForFinalization());

  await certificationReportRepository.finalizeAll(certificationReports);

  const finalizedSession = await sessionRepository.finalize({
    id: sessionId,
    examinerGlobalComment,
    finalizedAt: new Date(),
    hasIncident,
    hasJoiningIssue,
  });

  return new SessionFinalized({
    sessionId,
    finalizedAt: finalizedSession.finalizedAt,
    hasExaminerGlobalComment: Boolean(examinerGlobalComment),
    certificationCenterName: finalizedSession.certificationCenter,
    sessionDate: finalizedSession.date,
    sessionTime: finalizedSession.time,
  });
};
