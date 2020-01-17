const { SessionAlreadyFinalizedError } = require('../errors');
const { statuses } = require('../../domain/models/Session');

module.exports = async function finalizeSession({
  sessionId,
  examinerGlobalComment,
  certificationCourses,
  sessionRepository,
  certificationCourseRepository,
}) {
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);

  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError('Cannot finalize session more than once');
  }

  certificationCourses.forEach((certifCourse) => certifCourse.validateForFinalization());

  await certificationCourseRepository.finalizeAll(certificationCourses);

  return sessionRepository.updateStatusAndExaminerGlobalComment({
    id: sessionId,
    status: statuses.FINALIZED,
    examinerGlobalComment,
  });
};
