import bluebird from 'bluebird';

import { CertificationIssueReportResolutionAttempt } from '../models/CertificationIssueReportResolutionAttempt.js';
import { CertificationIssueReportResolutionStrategies } from '../models/CertificationIssueReportResolutionStrategies.js';
import { CertificationAssessment } from '../models/index.js';
import { AutoJuryDone } from './AutoJuryDone.js';
import { CertificationJuryDone } from './CertificationJuryDone.js';
import { checkEventTypes } from './check-event-types.js';
import { SessionFinalized } from './SessionFinalized.js';

const eventTypes = [SessionFinalized];

async function handleAutoJury({
  event,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  challengeRepository,
  logger,
}) {
  checkEventTypes(event, eventTypes);

  const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId: event.sessionId,
  });

  if (_areV3CertificationCourses(certificationCourses)) {
    return await _handleAutoJuryV3({
      event,
      certificationCourses,
      certificationAssessmentRepository,
    });
  }

  return await _handleAutoJuryV2({
    event,
    certificationCourses,
    certificationIssueReportRepository,
    challengeRepository,
    certificationAssessmentRepository,
    logger,
  });
}

async function _handleAutoJuryV2({
  event,
  certificationCourses,
  certificationIssueReportRepository,
  challengeRepository,
  certificationAssessmentRepository,
  logger,
}) {
  const resolutionStrategies = new CertificationIssueReportResolutionStrategies({
    certificationIssueReportRepository,
    challengeRepository,
  });

  const certificationJuryDoneEvents = [];

  for (const certificationCourse of certificationCourses) {
    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId: certificationCourse.getId(),
    });

    const hasAutoCompleteAnEffectOnScoring = await _autoCompleteUnfinishedTest({
      certificationCourse,
      certificationAssessment,
      certificationAssessmentRepository,
    });

    const hasAutoResolutionAnEffectOnScoring = await _autoResolveCertificationIssueReport({
      certificationCourse,
      certificationAssessment,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      resolutionStrategies,
      logger,
    });

    if (hasAutoResolutionAnEffectOnScoring || hasAutoCompleteAnEffectOnScoring) {
      const certificationJuryDoneEvent = new CertificationJuryDone({
        certificationCourseId: certificationCourse.getId(),
      });

      certificationJuryDoneEvents.push(certificationJuryDoneEvent);
    }
  }

  return [
    ...certificationJuryDoneEvents,
    new AutoJuryDone({
      sessionId: event.sessionId,
      finalizedAt: event.finalizedAt,
      certificationCenterName: event.certificationCenterName,
      sessionDate: event.sessionDate,
      sessionTime: event.sessionTime,
      hasExaminerGlobalComment: event.hasExaminerGlobalComment,
    }),
  ];
}

function _areV3CertificationCourses(certificationCourses) {
  return certificationCourses[0].isV3();
}

async function _handleAutoJuryV3({ certificationCourses, certificationAssessmentRepository, event }) {
  const certificationJuryDoneEvents = [];

  for (const certificationCourse of certificationCourses) {
    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId: certificationCourse.getId(),
    });

    if (_v3CertificationShouldBeScored(certificationAssessment)) {
      const certificationJuryDoneEvent = new CertificationJuryDone({
        certificationCourseId: certificationCourse.getId(),
      });

      certificationJuryDoneEvents.push(certificationJuryDoneEvent);
    }

    certificationAssessment.endDueToFinalization();

    await certificationAssessmentRepository.save(certificationAssessment);
  }

  return [
    ...certificationJuryDoneEvents,
    new AutoJuryDone({
      sessionId: event.sessionId,
      finalizedAt: event.finalizedAt,
      certificationCenterName: event.certificationCenterName,
      sessionDate: event.sessionDate,
      sessionTime: event.sessionTime,
      hasExaminerGlobalComment: event.hasExaminerGlobalComment,
    }),
  ];
}

function _v3CertificationShouldBeScored(certificationAssessment) {
  return (
    certificationAssessment.state === CertificationAssessment.states.STARTED ||
    certificationAssessment.state === CertificationAssessment.states.ENDED_BY_SUPERVISOR
  );
}

async function _autoCompleteUnfinishedTest({
  certificationCourse,
  certificationAssessment,
  certificationAssessmentRepository,
}) {
  if (certificationCourse.isCompleted()) {
    return false;
  }

  if (certificationCourse.isAbortReasonCandidateRelated()) {
    certificationAssessment.skipUnansweredChallenges();
  }

  if (certificationCourse.isAbortReasonTechnical()) {
    certificationAssessment.neutralizeUnansweredChallenges();
  }

  certificationAssessment.endDueToFinalization();

  await certificationAssessmentRepository.save(certificationAssessment);

  return true;
}

async function _autoResolveCertificationIssueReport({
  certificationCourse,
  certificationAssessment,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  resolutionStrategies,
  logger,
}) {
  const certificationIssueReports = await certificationIssueReportRepository.findByCertificationCourseId({
    certificationCourseId: certificationCourse.getId(),
  });
  if (certificationIssueReports.length === 0) {
    return null;
  }

  const resolutionAttempts = await bluebird.mapSeries(certificationIssueReports, async (certificationIssueReport) => {
    try {
      return await resolutionStrategies.resolve({ certificationIssueReport, certificationAssessment });
    } catch (e) {
      logger.error(e);
      return CertificationIssueReportResolutionAttempt.unresolved();
    }
  });

  if (resolutionAttempts.some((attempt) => attempt.isResolvedWithEffect())) {
    await certificationAssessmentRepository.save(certificationAssessment);
    return true;
  }

  return false;
}

handleAutoJury.eventTypes = eventTypes;
export { handleAutoJury };
