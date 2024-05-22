/**
 * @typedef {import('../../../session-management/domain/usecases/index.js').SessionRepository} SessionRepository
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 *
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationReportRepository} CertificationReportRepository
 */

import bluebird from 'bluebird';

import { SessionFinalized } from '../../../../../lib/domain/events/SessionFinalized.js';
import {
  SessionAlreadyFinalizedError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
} from '../errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationReportRepository} params.certificationReportRepository
 */
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
  const isSessionAlreadyFinalized = await sessionRepository.isFinalized({ id: sessionId });

  const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification({ id: sessionId });

  const uncompletedCertificationCount = await sessionRepository.countUncompletedCertificationsAssessment({
    id: sessionId,
  });

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

  await certificationReportRepository.finalizeAll({ certificationReports });

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
          await certificationCourseRepository.update({ certificationCourse: sessionCertificationCourse });
        }
      },
    );
  }
}
