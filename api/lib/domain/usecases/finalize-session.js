import {
  SessionAlreadyFinalizedError,
  SessionWithoutStartedCertificationError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionWithMissingAbortReasonError,
} from '../errors.js';

import { SessionFinalized } from '../events/SessionFinalized.js';
import bluebird from 'bluebird';

const finalizeSession = async function ({
  sessionId,
  examinerGlobalComment,
  certificationReports,
  sessionRepository,
  certificationCourseRepository,
  certificationReportRepository,
  hasIncident,
  hasJoiningIssue,
}) {
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized(sessionId);

  const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification(sessionId);

  const uncompletedCertificationCount = await sessionRepository.countUncompletedCertifications(sessionId);

  const abortReasonCount = _countAbortReasons(certificationReports);

  if (isSessionAlreadyFinalized) {
    throw new SessionAlreadyFinalizedError();
  }

  if (hasNoStartedCertification) {
    throw new SessionWithoutStartedCertificationError();
  }

  if (_hasMissingAbortReasonForUncompletedCertificationCourse({ abortReasonCount, uncompletedCertificationCount })) {
    throw new SessionWithMissingAbortReasonError();
  }

  if (
    _hasAbortReasonForCompletedCertificationCourse({
      abortReasonCount,
      uncompletedCertificationCount,
    })
  ) {
    await _removeAbortReasonFromCompletedCertificationCourses({
      certificationCourseRepository,
      certificationReports,
      sessionId,
    });

    throw new SessionWithAbortReasonOnCompletedCertificationCourseError();
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

export { finalizeSession };

function _hasAbortReasonForCompletedCertificationCourse({ abortReasonCount, uncompletedCertificationCount }) {
  return abortReasonCount > uncompletedCertificationCount;
}

function _hasMissingAbortReasonForUncompletedCertificationCourse({ abortReasonCount, uncompletedCertificationCount }) {
  return abortReasonCount < uncompletedCertificationCount;
}

function _countAbortReasons(certificationReports) {
  return certificationReports.filter(({ abortReason }) => abortReason).length;
}

async function _removeAbortReasonFromCompletedCertificationCourses({
  certificationCourseRepository,
  certificationReports,
  sessionId,
}) {
  const sessionCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  for (const sessionCertificationCourse of sessionCertificationCourses) {
    await bluebird.mapSeries(
      certificationReports,
      async ({ certificationCourseId: abortReasonCertificationCourseId, abortReason }) => {
        if (
          sessionCertificationCourse.getId() === abortReasonCertificationCourseId &&
          abortReason &&
          sessionCertificationCourse.isCompleted()
        ) {
          sessionCertificationCourse.unabort();
          await certificationCourseRepository.update(sessionCertificationCourse);
        }
      },
    );
  }
}
