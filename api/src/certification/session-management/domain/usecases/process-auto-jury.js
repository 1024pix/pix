/**
 * @typedef {import('./index.js').CertificationEvaluationRepository} CertificationEvaluationRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('../models/Session.js').Session} Session
 * @typedef {import('../models/CertificationCourse.js').CertificationCourse} CertificationCourse
 */
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { CertificationJuryDone } from '../events/CertificationJuryDone.js';
import { CertificationIssueReportResolutionAttempt } from '../models/CertificationIssueReportResolutionAttempt.js';
import { CertificationIssueReportResolutionStrategies } from '../models/CertificationIssueReportResolutionStrategies.js';

/**
 * @param {object} params
 * @param {Session} params.session
 * @param {CertificationEvaluationRepository} params.certificationEvaluationRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {SessionRepository} params.sessionRepository
 */
export async function processAutoJury({
  session,
  certificationIssueReportRepository,
  certificationAssessmentRepository,
  challengeRepository,
  certificationEvaluationRepository,
  sessionRepository,
}) {
  for (const certificationCourse of session.certificationCourses) {
    if (certificationCourse.isV3) {
      await _handleAutoJuryV3({
        certificationCourse,
        sessionRepository,
        certificationEvaluationRepository,
      });
    }

    if (certificationCourse.isV2) {
      await _handleAutoJuryV2({
        certificationCourse,
        certificationIssueReportRepository,
        challengeRepository,
        certificationAssessmentRepository,
        certificationEvaluationRepository,
      });
    }
  }
}

/**
 * @param {object} params
 * @param {CertificationCourse} params.certificationCourse
 * @param {CertificationEvaluationRepository} params.certificationEvaluationRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 */
async function _handleAutoJuryV2({
  certificationCourse,
  certificationIssueReportRepository,
  challengeRepository,
  certificationAssessmentRepository,
  certificationEvaluationRepository,
}) {
  const resolutionStrategies = new CertificationIssueReportResolutionStrategies({
    certificationIssueReportRepository,
    challengeRepository,
  });

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: certificationCourse.id,
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
      certificationCourseId: certificationCourse.id,
    });

    await certificationEvaluationRepository.rescoreV2Certification({
      event: certificationJuryDoneEvent,
    });
  }
}

/**
 * @param {object} params
 * @param {CertificationCourse} params.certificationCourse
 * @param {CertificationEvaluationRepository} params.certificationEvaluationRepository
 * @param {SessionRepository} params.sessionRepository
 */
async function _handleAutoJuryV3({ certificationCourse, sessionRepository, certificationEvaluationRepository }) {
  if (_v3CertificationShouldBeScored(certificationCourse)) {
    const certificationJuryDoneEvent = new CertificationJuryDone({
      certificationCourseId: certificationCourse.id,
    });

    await certificationEvaluationRepository.rescoreV3Certification({
      event: certificationJuryDoneEvent,
    });

    certificationCourse.endDueToFinalization();

    await sessionRepository.saveCertification({ certificationCourse });
  }
}

function _v3CertificationShouldBeScored(certificationCourse) {
  return certificationCourse.assessmentState !== Assessment.states.COMPLETED;
}

async function _autoCompleteUnfinishedTest({
  certificationCourse,
  certificationAssessment,
  certificationAssessmentRepository,
}) {
  if (certificationCourse.isCompleted) {
    return false;
  }

  if (certificationCourse.isAbortReasonCandidateRelated) {
    certificationAssessment.skipUnansweredChallenges();
  }

  if (certificationCourse.isAbortReasonTechnical) {
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
    certificationCourseId: certificationCourse.id,
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
