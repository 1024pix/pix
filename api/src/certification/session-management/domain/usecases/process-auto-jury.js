import { CertificationJuryDone } from '../../../../../lib/domain/events/CertificationJuryDone.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { AutoJuryDone } from '../events/AutoJuryDone.js';
import { CertificationAssessment } from '../models/CertificationAssessment.js';
import { CertificationIssueReportResolutionAttempt } from '../models/CertificationIssueReportResolutionAttempt.js';
import { CertificationIssueReportResolutionStrategies } from '../models/CertificationIssueReportResolutionStrategies.js';

export const processAutoJury = async ({
  sessionFinalized,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  challengeRepository,
}) => {
  const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId: sessionFinalized.sessionId,
  });

  if (_areV3CertificationCourses(certificationCourses)) {
    return await _handleAutoJuryV3({
      sessionFinalized,
      certificationCourses,
      certificationAssessmentRepository,
    });
  }

  return await _handleAutoJuryV2({
    sessionFinalized,
    certificationCourses,
    certificationIssueReportRepository,
    challengeRepository,
    certificationAssessmentRepository,
  });
};

async function _handleAutoJuryV2({
  sessionFinalized,
  certificationCourses,
  certificationIssueReportRepository,
  challengeRepository,
  certificationAssessmentRepository,
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
    });

    if (hasAutoResolutionAnEffectOnScoring || hasAutoCompleteAnEffectOnScoring) {
      const certificationJuryDoneEvent = new CertificationJuryDone({
        certificationCourseId: certificationCourse.getId(),
      });

      certificationJuryDoneEvents.push(certificationJuryDoneEvent);
    }
  }

  return {
    certificationJuryDoneEvents,
    autoJuryDone: new AutoJuryDone({
      sessionId: sessionFinalized.sessionId,
      finalizedAt: sessionFinalized.finalizedAt,
      certificationCenterName: sessionFinalized.certificationCenterName,
      sessionDate: sessionFinalized.sessionDate,
      sessionTime: sessionFinalized.sessionTime,
      hasExaminerGlobalComment: sessionFinalized.hasExaminerGlobalComment,
    }),
  };
}

function _areV3CertificationCourses(certificationCourses) {
  return certificationCourses[0].isV3();
}

async function _handleAutoJuryV3({ sessionFinalized, certificationCourses, certificationAssessmentRepository }) {
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

  return {
    certificationJuryDoneEvents,
    autoJuryDone: new AutoJuryDone({
      sessionId: sessionFinalized.sessionId,
      finalizedAt: sessionFinalized.finalizedAt,
      certificationCenterName: sessionFinalized.certificationCenterName,
      sessionDate: sessionFinalized.sessionDate,
      sessionTime: sessionFinalized.sessionTime,
      hasExaminerGlobalComment: sessionFinalized.hasExaminerGlobalComment,
    }),
  };
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
}) {
  const certificationIssueReports = await certificationIssueReportRepository.findByCertificationCourseId({
    certificationCourseId: certificationCourse.getId(),
  });
  if (certificationIssueReports.length === 0) {
    return null;
  }

  const resolutionAttempts = await PromiseUtils.mapSeries(
    certificationIssueReports,
    async (certificationIssueReport) => {
      try {
        return await resolutionStrategies.resolve({ certificationIssueReport, certificationAssessment });
      } catch (e) {
        logger.error(e);
        return CertificationIssueReportResolutionAttempt.unresolved();
      }
    },
  );

  if (resolutionAttempts.some((attempt) => attempt.isResolvedWithEffect())) {
    await certificationAssessmentRepository.save(certificationAssessment);
    return true;
  }

  return false;
}
